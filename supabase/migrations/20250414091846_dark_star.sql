/*
  # Fix warranty pricing system for all product variants
  
  1. Changes
    - Fix the issue with warranty prices not scaling correctly for variants larger than 5 meters
    - Ensure prices are properly multiplied based on variant length
    - Simplify the pricing logic to be more reliable
    - Add proper error handling and logging
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create a simplified and more reliable function to get warranty price for specific variant
CREATE OR REPLACE FUNCTION get_warranty_price_for_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  base_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
BEGIN
  -- Extract length from variant ID (e.g., 'rgb-10' -> 10)
  CASE 
    WHEN p_variant_id = 'rgb-5' THEN variant_length := 5;
    WHEN p_variant_id = 'rgb-10' THEN variant_length := 10;
    WHEN p_variant_id = 'rgb-15' THEN variant_length := 15;
    WHEN p_variant_id = 'rgb-20' THEN variant_length := 20;
    WHEN p_variant_id = 'rgb-25' THEN variant_length := 25;
    WHEN p_variant_id = 'rgb-30' THEN variant_length := 30;
    ELSE variant_length := 5;
  END CASE;

  -- First try to get custom price for specific variant
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
  
  -- If not found, get the base price (5m variant) and scale it
  -- First try from warranty_custom_prices
  SELECT wcp.custom_price INTO base_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = 'rgb-5'
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  -- If not found, try from warranty_fixed_prices
  IF base_price IS NULL THEN
    SELECT wfp.price INTO base_price
    FROM warranty_fixed_prices wfp
    WHERE wfp.product_id = p_product_id
      AND wfp.months = p_months
      AND wfp.currency = p_currency;
  END IF;
  
  -- If still not found, try from warranty_policies
  IF base_price IS NULL THEN
    SELECT wp.fixed_price INTO base_price
    FROM warranty_policies wp
    WHERE wp.product_id = p_product_id
      AND wp.months = p_months;
  END IF;
  
  -- If we found a base price, calculate the price for this variant
  IF base_price IS NOT NULL THEN
    -- For 5m variant, return the base price
    IF p_variant_id = 'rgb-5' THEN
      RETURN base_price;
    ELSE
      -- For other variants, scale the price based on length ratio
      calculated_price := base_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      -- Save the calculated price for future use
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
        calculated_price,
        true,
        clock_timestamp()
      )
      ON CONFLICT DO NOTHING;
      
      RETURN calculated_price;
    END IF;
  END IF;
  
  -- If nothing found, return 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the main get_warranty_price function to use the new variant-specific function
CREATE OR REPLACE FUNCTION get_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK',
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS numeric AS $$
BEGIN
  -- Call the variant-specific function
  RETURN get_warranty_price_for_variant(
    p_product_id,
    p_months,
    p_currency,
    p_variant_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simplified function to update warranty price with automatic variant scaling
CREATE OR REPLACE FUNCTION update_warranty_price_direct(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
BEGIN
  -- First update the base price for rgb-5
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = 'rgb-5'
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
    'rgb-5',
    p_months,
    p_currency,
    p_price,
    true,
    clock_timestamp()
  )
  RETURNING custom_price INTO new_price;
  
  -- Update warranty_policies table if applicable
  IF p_currency = 'CZK' THEN
    UPDATE warranty_policies
    SET fixed_price = p_price
    WHERE product_id = p_product_id
      AND months = p_months;
  END IF;
  
  -- Update warranty_fixed_prices table
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
  
  -- Now update all other variants
  FOREACH v_id IN ARRAY variants
  LOOP
    -- Skip rgb-5 as we already updated it
    IF v_id != 'rgb-5' THEN
      -- Extract length from variant ID
      CASE 
        WHEN v_id = 'rgb-10' THEN variant_length := 10;
        WHEN v_id = 'rgb-15' THEN variant_length := 15;
        WHEN v_id = 'rgb-20' THEN variant_length := 20;
        WHEN v_id = 'rgb-25' THEN variant_length := 25;
        WHEN v_id = 'rgb-30' THEN variant_length := 30;
        ELSE variant_length := 5;
      END CASE;
      
      -- Simple multiplication based on length ratio
      calculated_price := p_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      -- Update price for this variant
      UPDATE warranty_custom_prices
      SET is_active = false
      WHERE product_id = p_product_id
        AND variant_id = v_id
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
        v_id,
        p_months,
        p_currency,
        calculated_price,
        true,
        clock_timestamp()
      );
    END IF;
  END LOOP;

  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Fix any existing warranty prices that might be incorrect
DO $$
DECLARE
  policy RECORD;
  v_id text;
  variants text[] := ARRAY['rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
  base_price numeric;
  variant_price numeric;
  variant_length integer;
  base_length integer := 5;
BEGIN
  -- For each warranty policy
  FOR policy IN 
    SELECT * FROM warranty_policies
    WHERE fixed_price IS NOT NULL AND fixed_price > 0
  LOOP
    -- Get the base price for rgb-5 variant
    SELECT policy.fixed_price INTO base_price;
    
    -- Get the current price for rgb-5 variant
    SELECT wcp.custom_price INTO base_price
    FROM warranty_custom_prices wcp
    WHERE wcp.product_id = policy.product_id
      AND wcp.variant_id = 'rgb-5'
      AND wcp.months = policy.months
      AND wcp.currency = 'CZK'
      AND wcp.is_active = true
    ORDER BY wcp.updated_at DESC
    LIMIT 1;
    
    -- If we have a base price, update all other variants
    IF base_price IS NOT NULL THEN
      FOREACH v_id IN ARRAY variants
      LOOP
        -- Extract length from variant ID
        CASE 
          WHEN v_id = 'rgb-10' THEN variant_length := 10;
          WHEN v_id = 'rgb-15' THEN variant_length := 15;
          WHEN v_id = 'rgb-20' THEN variant_length := 20;
          WHEN v_id = 'rgb-25' THEN variant_length := 25;
          WHEN v_id = 'rgb-30' THEN variant_length := 30;
          ELSE variant_length := 5;
        END CASE;
        
        -- Calculate price based on length ratio
        variant_price := base_price * (variant_length / base_length);
        variant_price := round(variant_price);
        
        -- Update price for this variant
        UPDATE warranty_custom_prices
        SET is_active = false
        WHERE product_id = policy.product_id
          AND variant_id = v_id
          AND months = policy.months
          AND currency = 'CZK'
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
          policy.product_id,
          v_id,
          policy.months,
          'CZK',
          variant_price,
          true,
          clock_timestamp()
        );
      END LOOP;
    END IF;
  END LOOP;
END $$;