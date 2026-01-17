/*
  # Fix price integration between tables
  
  1. Changes
    - Create improved functions for price synchronization
    - Fix product price retrieval in frontend
    - Ensure proper data flow between tables
    - Add indexes for better performance
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create or replace function to get product price with proper fallback
CREATE OR REPLACE FUNCTION get_product_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  base_price numeric;
BEGIN
  -- First try to get custom price from product_prices table
  SELECT pp.custom_price INTO custom_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;
  
  -- If found, return it
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- If not found, try to get from products table
  SELECT (value->>'price')::numeric INTO base_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;
  
  -- Return base price or 0 if not found
  RETURN COALESCE(base_price, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to get warranty price with proper fallback
CREATE OR REPLACE FUNCTION get_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  fixed_price numeric;
  policy_multiplier numeric;
  base_product_price numeric;
  calculated_price numeric;
BEGIN
  -- First try to get custom price from warranty_custom_prices table
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
  
  -- Next try to get fixed price from warranty_fixed_prices table
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  -- If found, return it
  IF fixed_price IS NOT NULL THEN
    RETURN fixed_price;
  END IF;
  
  -- Next try to get fixed price from warranty_policies table
  SELECT wp.fixed_price INTO fixed_price
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  -- If found, return it
  IF fixed_price IS NOT NULL THEN
    RETURN fixed_price;
  END IF;
  
  -- Finally, try to calculate price based on multiplier
  SELECT wp.price_multiplier INTO policy_multiplier
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  IF policy_multiplier IS NOT NULL THEN
    -- Get base product price for calculation
    SELECT get_product_price(p_product_id, 
      (SELECT value->>'id' 
       FROM products p, jsonb_array_elements(p.variants) AS value
       WHERE p.id = p_product_id
       LIMIT 1),
      p_currency) INTO base_product_price;
    
    -- Calculate warranty price
    calculated_price := base_product_price * policy_multiplier;
    RETURN calculated_price;
  END IF;
  
  -- If nothing found, return 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create or replace function to update product price with proper synchronization
CREATE OR REPLACE FUNCTION update_product_price_direct(
  p_product_id integer,
  p_variant_id text,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  variant_index integer;
  variant_length integer;
BEGIN
  -- First deactivate any existing prices
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND currency = p_currency
    AND is_active = true;
    
  -- Insert new price record
  INSERT INTO product_prices (
    product_id,
    variant_id,
    currency,
    custom_price,
    is_active,
    updated_at
  ) VALUES (
    p_product_id,
    p_variant_id,
    p_currency,
    p_price,
    true,
    clock_timestamp()
  )
  RETURNING custom_price INTO new_price;
  
  -- If updating CZK price, also update the products table
  IF p_currency = 'CZK' THEN
    -- Find the variant index and length
    SELECT 
      (ordinality - 1)::integer,
      (value->>'length')::integer
    INTO 
      variant_index,
      variant_length
    FROM 
      products,
      jsonb_array_elements(variants) WITH ORDINALITY
    WHERE 
      id = p_product_id AND
      value->>'id' = p_variant_id;
    
    -- Update the products table if variant found
    IF variant_index IS NOT NULL THEN
      UPDATE products
      SET 
        variants = jsonb_set(
          variants,
          ARRAY[variant_index::text],
          jsonb_build_object(
            'id', p_variant_id,
            'length', variant_length,
            'price', p_price
          )
        ),
        updated_at = now()
      WHERE id = p_product_id;
    END IF;
  END IF;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating product price: %', SQLERRM;
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
    UPDATE warranty_policies
    SET 
      fixed_price = p_price,
      updated_at = now()
    WHERE 
      product_id = p_product_id AND
      months = p_months;
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

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS product_prices_lookup_idx 
ON product_prices (product_id, variant_id, currency, is_active);

CREATE INDEX IF NOT EXISTS warranty_custom_prices_product_months_currency_idx 
ON warranty_custom_prices (product_id, months, currency, is_active);

-- Create function to sync all prices between tables
CREATE OR REPLACE FUNCTION sync_all_prices() RETURNS void AS $$
BEGIN
  -- Sync product prices from products table to product_prices
  INSERT INTO product_prices (
    product_id,
    variant_id,
    currency,
    custom_price,
    is_active
  )
  SELECT 
    p.id,
    (v->>'id')::text,
    'CZK',
    (v->>'price')::numeric,
    true
  FROM 
    products p,
    jsonb_array_elements(p.variants) AS v
  WHERE 
    NOT EXISTS (
      SELECT 1 
      FROM product_prices pp 
      WHERE 
        pp.product_id = p.id AND 
        pp.variant_id = (v->>'id')::text AND 
        pp.currency = 'CZK' AND
        pp.is_active = true
    )
  ON CONFLICT DO NOTHING;
  
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function to ensure all prices are properly synchronized
SELECT sync_all_prices();