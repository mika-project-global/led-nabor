/*
  # Fix warranty price editing in admin panel
  
  1. Changes
    - Fix warranty price editing in admin panel
    - Ensure proper data flow between tables
    - Add function to get warranty prices for specific product and variant
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create or replace function to get warranty prices for specific product
CREATE OR REPLACE FUNCTION get_warranty_prices_for_product(
  p_product_id integer,
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  id uuid,
  product_id integer,
  months integer,
  currency text,
  custom_price numeric,
  is_active boolean,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wp.id,
    wp.product_id,
    wp.months,
    wp.currency,
    wp.custom_price,
    wp.is_active,
    wp.updated_at
  FROM warranty_custom_prices wp
  WHERE wp.product_id = p_product_id
    AND wp.currency = p_currency
    AND wp.is_active = true
  ORDER BY wp.months;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to update warranty price with proper synchronization
CREATE OR REPLACE FUNCTION update_warranty_price_direct(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  warranty_id uuid;
BEGIN
  -- First deactivate any existing prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  -- Insert new price record
  INSERT INTO warranty_custom_prices (
    product_id,
    months,
    currency,
    custom_price,
    is_active,
    updated_at
  ) VALUES (
    p_product_id,
    p_months,
    p_currency,
    p_price,
    true,
    clock_timestamp()
  )
  RETURNING custom_price INTO new_price;
  
  -- If updating CZK price, also update the warranty_policies table
  IF p_currency = 'CZK' THEN
    -- Find the warranty policy ID
    SELECT id INTO warranty_id
    FROM warranty_policies
    WHERE product_id = p_product_id
      AND months = p_months;
      
    -- Update the warranty_policies table if policy found
    IF warranty_id IS NOT NULL THEN
      UPDATE warranty_policies
      SET 
        fixed_price = p_price,
        updated_at = now()
      WHERE id = warranty_id;
    END IF;
  END IF;
  
  -- Also update warranty_fixed_prices table
  INSERT INTO warranty_fixed_prices (
    product_id,
    months,
    currency,
    price
  ) VALUES (
    p_product_id,
    p_months,
    p_currency,
    p_price
  )
  ON CONFLICT (product_id, months, currency) 
  DO UPDATE SET price = EXCLUDED.price;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get warranty price with proper fallback
CREATE OR REPLACE FUNCTION get_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  fixed_price numeric;
  policy_price numeric;
  policy_multiplier numeric;
  base_product_price numeric;
BEGIN
  -- First try warranty_custom_prices table
  SELECT wcp.custom_price INTO custom_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  -- If found, return it
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- Next try warranty_fixed_prices table
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  -- If found, return it
  IF fixed_price IS NOT NULL THEN
    RETURN fixed_price;
  END IF;
  
  -- Next try warranty_policies table
  SELECT wp.fixed_price, wp.price_multiplier INTO policy_price, policy_multiplier
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  -- If found with fixed_price, return it
  IF policy_price IS NOT NULL THEN
    RETURN policy_price;
  END IF;
  
  -- If found with price_multiplier, calculate price
  IF policy_multiplier IS NOT NULL THEN
    -- Get base product price for calculation
    SELECT get_product_price(p_product_id, 
      (SELECT value->>'id' 
       FROM products p, jsonb_array_elements(p.variants) AS value
       WHERE p.id = p_product_id
       LIMIT 1),
      p_currency) INTO base_product_price;
    
    -- Calculate warranty price
    RETURN base_product_price * policy_multiplier;
  END IF;
  
  -- If nothing found, return 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync warranty prices from warranty_policies to warranty_custom_prices
INSERT INTO warranty_custom_prices (
  product_id,
  months,
  currency,
  custom_price,
  is_active
)
SELECT 
  wp.product_id,
  wp.months,
  'CZK',
  COALESCE(wp.fixed_price, 0),
  true
FROM 
  warranty_policies wp
WHERE 
  wp.fixed_price IS NOT NULL AND
  NOT EXISTS (
    SELECT 1 
    FROM warranty_custom_prices wcp 
    WHERE 
      wcp.product_id = wp.product_id AND 
      wcp.months = wp.months AND 
      wcp.currency = 'CZK' AND
      wcp.is_active = true
  )
ON CONFLICT DO NOTHING;