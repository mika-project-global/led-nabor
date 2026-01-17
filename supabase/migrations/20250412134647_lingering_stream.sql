/*
  # Fix warranty prices function
  
  1. Changes
    - Drop existing get_warranty_prices function
    - Create new get_warranty_prices function with correct signature
    - Add variant_id column to warranty_custom_prices table
    - Create indexes for better performance
    
  2. Security
    - Maintain existing RLS policies
*/

-- First drop the existing function that's causing the error
DROP FUNCTION IF EXISTS get_warranty_prices(text);

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

-- Create index for variant-specific warranty prices
CREATE INDEX IF NOT EXISTS warranty_custom_prices_product_variant_months_idx 
ON warranty_custom_prices (product_id, variant_id, months, currency, is_active);

-- Create new function with correct signature
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
    AND wcp.variant_id = 'rgb-5'
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
      'rgb-5',
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
      AND wcp.variant_id = 'rgb-5'
    ORDER BY wcp.product_id, wcp.months;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get warranty prices by variant
CREATE OR REPLACE FUNCTION get_warranty_prices_by_variant(
  p_currency text,
  p_variant_id text
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
    AND wcp.variant_id = p_variant_id
    AND wcp.is_active = true
  ORDER BY wcp.product_id, wcp.months;
  
  -- If no results, try with default variant
  IF NOT FOUND AND p_variant_id != 'rgb-5' THEN
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
      AND wcp.variant_id = 'rgb-5'
      AND wcp.is_active = true
    ORDER BY wcp.product_id, wcp.months;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update warranty price by variant
CREATE OR REPLACE FUNCTION update_warranty_price_by_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  warranty_id uuid;
BEGIN
  -- First deactivate any existing prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
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
  
  -- If updating CZK price for default variant, also update the warranty_policies table
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
    END IF;
  END IF;
  
  -- Also update warranty_fixed_prices table for the default variant
  IF p_variant_id = 'rgb-5' THEN
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
  END IF;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update warranty price (simplified version)
CREATE OR REPLACE FUNCTION update_warranty_price_direct(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
BEGIN
  -- Call the variant-specific function with default variant
  RETURN update_warranty_price_by_variant(
    p_product_id,
    p_months,
    p_currency,
    p_price,
    'rgb-5'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing warranty prices to include variant_id
UPDATE warranty_custom_prices
SET variant_id = 'rgb-5'
WHERE variant_id IS NULL OR variant_id = '';

-- Ensure all warranty policies have entries in warranty_custom_prices for each variant
DO $$
DECLARE
  policy RECORD;
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
BEGIN
  FOR policy IN 
    SELECT * FROM warranty_policies
  LOOP
    FOREACH v_id IN ARRAY variants
    LOOP
      -- Only insert if no active price exists
      IF NOT EXISTS (
        SELECT 1 
        FROM warranty_custom_prices 
        WHERE product_id = policy.product_id 
          AND variant_id = v_id
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
          v_id,
          policy.months,
          'CZK',
          COALESCE(policy.fixed_price, 0),
          true
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;