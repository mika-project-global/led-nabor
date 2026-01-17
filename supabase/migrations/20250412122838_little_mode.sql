/*
  # Fix warranty price editing in admin panel
  
  1. Changes
    - Fix warranty price editing in admin panel
    - Improve update_warranty_price_direct function
    - Add better error handling and logging
    
  2. Security
    - Maintain existing RLS policies
*/

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
  existing_price_id uuid;
BEGIN
  -- Log the request for debugging
  RAISE NOTICE 'Updating warranty price: product_id=%, months=%, currency=%, price=%', 
    p_product_id, p_months, p_currency, p_price;

  -- Check if price already exists
  SELECT id INTO existing_price_id
  FROM warranty_custom_prices
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  -- First deactivate any existing prices
  IF existing_price_id IS NOT NULL THEN
    UPDATE warranty_custom_prices
    SET is_active = false
    WHERE id = existing_price_id;
  END IF;
    
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
      
      RAISE NOTICE 'Updated warranty_policy with id=%', warranty_id;
    ELSE
      RAISE NOTICE 'No warranty policy found for product_id=% and months=%', p_product_id, p_months;
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
  
  RAISE NOTICE 'Successfully updated warranty price to %', new_price;
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get warranty prices with better error handling
CREATE OR REPLACE FUNCTION get_warranty_prices(
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
    wcp.id,
    wcp.product_id,
    wcp.months,
    wcp.currency,
    wcp.custom_price,
    wcp.is_active,
    wcp.updated_at
  FROM warranty_custom_prices wcp
  WHERE wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.product_id, wcp.months;
  
  -- If no results, try to sync from warranty_policies
  IF NOT FOUND THEN
    -- Insert default warranty prices from policies
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
      wp.fixed_price IS NOT NULL
    ON CONFLICT DO NOTHING;
    
    -- Return the newly inserted prices
    RETURN QUERY
    SELECT 
      wcp.id,
      wcp.product_id,
      wcp.months,
      wcp.currency,
      wcp.custom_price,
      wcp.is_active,
      wcp.updated_at
    FROM warranty_custom_prices wcp
    WHERE wcp.currency = p_currency
      AND wcp.is_active = true
    ORDER BY wcp.product_id, wcp.months;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new warranty price entries
CREATE OR REPLACE FUNCTION handle_new_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric
) RETURNS uuid AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Deactivate any existing prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  -- Insert new price
  INSERT INTO warranty_custom_prices (
    product_id,
    months,
    currency,
    custom_price,
    is_active
  ) VALUES (
    p_product_id,
    p_months,
    p_currency,
    p_price,
    true
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all warranty policies have entries in warranty_custom_prices
DO $$
DECLARE
  policy RECORD;
BEGIN
  FOR policy IN 
    SELECT * FROM warranty_policies
  LOOP
    -- Only insert if no active price exists
    IF NOT EXISTS (
      SELECT 1 
      FROM warranty_custom_prices 
      WHERE product_id = policy.product_id 
        AND months = policy.months 
        AND currency = 'CZK'
        AND is_active = true
    ) THEN
      -- Insert price record
      INSERT INTO warranty_custom_prices (
        product_id,
        months,
        currency,
        custom_price,
        is_active
      ) VALUES (
        policy.product_id,
        policy.months,
        'CZK',
        COALESCE(policy.fixed_price, 0),
        true
      );
      
      RAISE NOTICE 'Created warranty price for product_id=%, months=%', 
        policy.product_id, policy.months;
    END IF;
  END LOOP;
END $$;