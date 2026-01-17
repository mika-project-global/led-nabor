/*
  # Fix warranty pricing for different product variants
  
  1. Changes
    - Create new function to get warranty price specifically for variants
    - Fix issue with variant-specific pricing not being applied
    - Add direct SQL function to retrieve prices without JavaScript calculation
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create a new function that directly returns the correct price for a variant
CREATE OR REPLACE FUNCTION get_warranty_price_for_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  default_price numeric;
  fixed_price numeric;
  policy_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
BEGIN
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
  
  -- If not found and not default variant, try default variant and scale
  IF p_variant_id != 'rgb-5' THEN
    -- Extract length from variant ID (e.g., 'rgb-10' -> 10)
    CASE 
      WHEN p_variant_id = 'rgb-10' THEN variant_length := 10;
      WHEN p_variant_id = 'rgb-15' THEN variant_length := 15;
      WHEN p_variant_id = 'rgb-20' THEN variant_length := 20;
      WHEN p_variant_id = 'rgb-25' THEN variant_length := 25;
      WHEN p_variant_id = 'rgb-30' THEN variant_length := 30;
      ELSE variant_length := 5;
    END CASE;
    
    -- Get base price for rgb-5
    SELECT wcp.custom_price INTO default_price
    FROM warranty_custom_prices wcp
    WHERE wcp.product_id = p_product_id
      AND wcp.variant_id = 'rgb-5'
      AND wcp.months = p_months
      AND wcp.currency = p_currency
      AND wcp.is_active = true
    ORDER BY wcp.updated_at DESC
    LIMIT 1;
    
    -- If found, scale it based on length ratio
    IF default_price IS NOT NULL THEN
      calculated_price := default_price * (variant_length::numeric / base_length::numeric);
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
  
  -- Next try warranty_fixed_prices table
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  -- If found and not default variant, scale it
  IF fixed_price IS NOT NULL THEN
    IF p_variant_id = 'rgb-5' THEN
      RETURN fixed_price;
    ELSE
      -- Extract length from variant ID
      CASE 
        WHEN p_variant_id = 'rgb-10' THEN variant_length := 10;
        WHEN p_variant_id = 'rgb-15' THEN variant_length := 15;
        WHEN p_variant_id = 'rgb-20' THEN variant_length := 20;
        WHEN p_variant_id = 'rgb-25' THEN variant_length := 25;
        WHEN p_variant_id = 'rgb-30' THEN variant_length := 30;
        ELSE variant_length := 5;
      END CASE;
      
      calculated_price := fixed_price * (variant_length::numeric / base_length::numeric);
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
  
  -- Finally try warranty_policies table
  SELECT wp.fixed_price INTO policy_price
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  -- If found and not default variant, scale it
  IF policy_price IS NOT NULL THEN
    IF p_variant_id = 'rgb-5' THEN
      RETURN policy_price;
    ELSE
      -- Extract length from variant ID
      CASE 
        WHEN p_variant_id = 'rgb-10' THEN variant_length := 10;
        WHEN p_variant_id = 'rgb-15' THEN variant_length := 15;
        WHEN p_variant_id = 'rgb-20' THEN variant_length := 20;
        WHEN p_variant_id = 'rgb-25' THEN variant_length := 25;
        WHEN p_variant_id = 'rgb-30' THEN variant_length := 30;
        ELSE variant_length := 5;
      END CASE;
      
      calculated_price := policy_price * (variant_length::numeric / base_length::numeric);
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

-- Create a function to update warranty prices for all variants when base price changes
CREATE OR REPLACE FUNCTION update_warranty_price_with_variants(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_base_price numeric
) RETURNS void AS $$
DECLARE
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
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
    p_base_price,
    true,
    clock_timestamp()
  );
  
  -- Update warranty_policies table if applicable
  IF p_currency = 'CZK' THEN
    UPDATE warranty_policies
    SET fixed_price = p_base_price
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
    p_base_price
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
      
      -- Calculate price based on length ratio
      calculated_price := p_base_price * (variant_length::numeric / base_length::numeric);
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the update_warranty_price_for_variant function to use the new function
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
  -- If updating the base variant, update all variants
  IF p_variant_id = 'rgb-5' THEN
    PERFORM update_warranty_price_with_variants(
      p_product_id,
      p_months,
      p_currency,
      p_price
    );
    
    RETURN p_price;
  ELSE
    -- Just update this specific variant
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
    
    RETURN new_price;
  END IF;
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
        
        -- Calculate price based on length ratio
        IF v_id = 'rgb-5' THEN
          variant_price := base_price;
        ELSE
          variant_price := base_price * (variant_length::numeric / base_length::numeric);
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