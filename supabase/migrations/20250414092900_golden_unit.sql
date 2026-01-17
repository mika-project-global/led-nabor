/*
  # Add variant-specific warranty pricing
  
  1. Changes
    - Add function to get warranty prices for specific variants
    - Add function to update warranty prices for specific variants
    - Add UI support for selecting variants in admin panel
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create function to get warranty prices for specific variant
CREATE OR REPLACE FUNCTION get_warranty_prices_by_variant(
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update warranty price for specific variant
CREATE OR REPLACE FUNCTION update_warranty_price_for_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
BEGIN
  -- Update price for this specific variant only
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
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
  
  -- If updating the base variant (rgb-5) in CZK, also update the warranty_policies table
  IF p_variant_id = 'rgb-5' AND p_currency = 'CZK' THEN
    UPDATE warranty_policies
    SET fixed_price = p_price
    WHERE product_id = p_product_id
      AND months = p_months;
      
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
  END IF;

  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster warranty price lookups by variant
CREATE INDEX IF NOT EXISTS warranty_custom_prices_product_variant_months_currency_idx 
ON warranty_custom_prices (product_id, variant_id, months, currency, is_active);

-- Ensure all warranty policies have entries in warranty_custom_prices for each variant
DO $$
DECLARE
  policy RECORD;
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
  base_price numeric;
  variant_price numeric;
  variant_length integer;
  base_length integer := 5; -- Default length for rgb-5
BEGIN
  FOR policy IN 
    SELECT * FROM warranty_policies
  LOOP
    -- Get the base price for rgb-5 variant
    SELECT COALESCE(policy.fixed_price, 0) INTO base_price;
    
    -- Only proceed if we have a base price
    IF base_price > 0 THEN
      FOREACH v_id IN ARRAY variants
      LOOP
        -- Extract length from variant ID (e.g., 'rgb-10' -> 10)
        CASE 
          WHEN v_id = 'rgb-5' THEN variant_length := 5;
          WHEN v_id = 'rgb-10' THEN variant_length := 10;
          WHEN v_id = 'rgb-15' THEN variant_length := 15;
          WHEN v_id = 'rgb-20' THEN variant_length := 20;
          WHEN v_id = 'rgb-25' THEN variant_length := 25;
          WHEN v_id = 'rgb-30' THEN variant_length := 30;
          ELSE variant_length := 5;
        END CASE;
        
        -- Calculate price based on length ratio - simple multiplication
        IF v_id = 'rgb-5' THEN
          variant_price := base_price;
        ELSE
          variant_price := base_price * (variant_length / base_length);
          variant_price := round(variant_price);
        END IF;
        
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
            variant_price,
            true
          );
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;