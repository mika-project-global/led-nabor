/*
  # Fix warranty price editing for specific variants
  
  1. Changes
    - Add variant_id column to warranty_custom_prices table
    - Update update_warranty_price_direct function to handle variant-specific prices
    - Add function to get warranty price for specific variant
    - Fix price synchronization between tables
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add variant_id column to warranty_custom_prices if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'warranty_custom_prices' AND column_name = 'variant_id'
  ) THEN
    ALTER TABLE warranty_custom_prices ADD COLUMN variant_id text DEFAULT 'rgb-5';
  END IF;
END $$;

-- Create new index for variant-specific warranty prices
CREATE INDEX IF NOT EXISTS warranty_custom_prices_product_variant_months_idx 
ON warranty_custom_prices (product_id, variant_id, months, currency, is_active);

-- Create or replace function to update warranty price with variant support
CREATE OR REPLACE FUNCTION update_warranty_price_direct(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric,
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  warranty_id uuid;
  existing_price_id uuid;
BEGIN
  -- Log the request for debugging
  RAISE NOTICE 'Updating warranty price: product_id=%, variant_id=%, months=%, currency=%, price=%', 
    p_product_id, p_variant_id, p_months, p_currency, p_price;

  -- Check if price already exists
  SELECT id INTO existing_price_id
  FROM warranty_custom_prices
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
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
    variant_id,
    months,
    currency,
    custom_price,
    is_active,
    updated_at
  ) VALUES (
    p_product_id,
    p_variant_id,
    p_months,
    p_currency,
    p_price,
    true,
    clock_timestamp()
  )
  RETURNING custom_price INTO new_price;
  
  -- If updating CZK price, also update the warranty_policies table
  IF p_currency = 'CZK' AND p_variant_id = 'rgb-5' THEN
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

-- Create or replace function to get warranty price with variant support
CREATE OR REPLACE FUNCTION get_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK',
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  fixed_price numeric;
  policy_price numeric;
  policy_multiplier numeric;
  base_product_price numeric;
BEGIN
  -- First try warranty_custom_prices table with variant
  SELECT wcp.custom_price INTO custom_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = p_variant_id
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  -- If found, return it
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- Try warranty_custom_prices table with default variant
  IF p_variant_id != 'rgb-5' THEN
    SELECT wcp.custom_price INTO custom_price
    FROM warranty_custom_prices wcp
    WHERE wcp.product_id = p_product_id
      AND wcp.variant_id = 'rgb-5'
      AND wcp.months = p_months
      AND wcp.currency = p_currency
      AND wcp.is_active = true
    ORDER BY wcp.updated_at DESC
    LIMIT 1;
    
    -- If found, return it
    IF custom_price IS NOT NULL THEN
      RETURN custom_price;
    END IF;
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
    SELECT get_product_price(p_product_id, p_variant_id, p_currency) INTO base_product_price;
    
    -- Calculate warranty price
    RETURN base_product_price * policy_multiplier;
  END IF;
  
  -- If nothing found, return 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get warranty prices for admin panel with variant support
CREATE OR REPLACE FUNCTION get_warranty_prices(
  p_currency text DEFAULT 'CZK',
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS TABLE (
  id uuid,
  product_id integer,
  variant_id text,
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
    wcp.variant_id,
    wcp.months,
    wcp.currency,
    wcp.custom_price,
    wcp.is_active,
    wcp.updated_at
  FROM warranty_custom_prices wcp
  WHERE wcp.currency = p_currency
    AND wcp.variant_id = p_variant_id
    AND wcp.is_active = true
  ORDER BY wcp.product_id, wcp.months;
  
  -- If no results, try to sync from warranty_policies
  IF NOT FOUND THEN
    -- Insert default warranty prices from policies
    INSERT INTO warranty_custom_prices (
      product_id,
      variant_id,
      months,
      currency,
      custom_price,
      is_active
    )
    SELECT 
      wp.product_id,
      p_variant_id,
      wp.months,
      p_currency,
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
      wcp.variant_id,
      wcp.months,
      wcp.currency,
      wcp.custom_price,
      wcp.is_active,
      wcp.updated_at
    FROM warranty_custom_prices wcp
    WHERE wcp.currency = p_currency
      AND wcp.variant_id = p_variant_id
      AND wcp.is_active = true
    ORDER BY wcp.product_id, wcp.months;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing warranty prices to include variant_id
UPDATE warranty_custom_prices
SET variant_id = 'rgb-5'
WHERE variant_id IS NULL;

-- Ensure all warranty policies have entries in warranty_custom_prices for each variant
DO $$
DECLARE
  policy RECORD;
  variant RECORD;
BEGIN
  FOR policy IN 
    SELECT * FROM warranty_policies
  LOOP
    FOR variant IN
      SELECT value->>'id' as variant_id
      FROM products p, jsonb_array_elements(p.variants) AS value
      WHERE p.id = policy.product_id
    LOOP
      -- Only insert if no active price exists
      IF NOT EXISTS (
        SELECT 1 
        FROM warranty_custom_prices 
        WHERE product_id = policy.product_id 
          AND variant_id = variant.variant_id
          AND months = policy.months 
          AND currency = 'CZK'
          AND is_active = true
      ) THEN
        -- Insert price record
        INSERT INTO warranty_custom_prices (
          product_id,
          variant_id,
          months,
          currency,
          custom_price,
          is_active
        ) VALUES (
          policy.product_id,
          variant.variant_id,
          policy.months,
          'CZK',
          COALESCE(policy.fixed_price, 0),
          true
        );
        
        RAISE NOTICE 'Created warranty price for product_id=%, variant_id=%, months=%', 
          policy.product_id, variant.variant_id, policy.months;
      END IF;
    END LOOP;
  END LOOP;
END $$;