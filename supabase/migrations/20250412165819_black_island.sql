/*
  # Fix warranty pricing for different product variants
  
  1. Changes
    - Fix variant-specific warranty pricing
    - Ensure prices are correctly applied for each variant
    - Add proper error handling
*/

-- Create function to get warranty price for specific variant
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
  policy_multiplier numeric;
  base_product_price numeric;
  calculated_price numeric;
  variant_length integer;
  base_length integer := 5;
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
  
  -- If not found and not default variant, try default variant
  IF p_variant_id != 'rgb-5' THEN
    SELECT wcp.custom_price INTO default_price
    FROM warranty_custom_prices wcp
    WHERE wcp.product_id = p_product_id
      AND wcp.variant_id = 'rgb-5'
      AND wcp.months = p_months
      AND wcp.currency = p_currency
      AND wcp.is_active = true
    ORDER BY wcp.updated_at DESC
    LIMIT 1;
    
    -- If found, calculate price based on variant length
    IF default_price IS NOT NULL THEN
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
      
      -- Calculate price based on length ratio
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
  
  -- If found, return it
  IF fixed_price IS NOT NULL THEN
    RETURN fixed_price;
  END IF;
  
  -- Finally try warranty_policies table
  SELECT wp.fixed_price, wp.price_multiplier INTO policy_price, policy_multiplier
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  -- If found with fixed_price, calculate based on variant length
  IF policy_price IS NOT NULL THEN
    -- Extract length from variant ID
    CASE 
      WHEN p_variant_id = 'rgb-5' THEN variant_length := 5;
      WHEN p_variant_id = 'rgb-10' THEN variant_length := 10;
      WHEN p_variant_id = 'rgb-15' THEN variant_length := 15;
      WHEN p_variant_id = 'rgb-20' THEN variant_length := 20;
      WHEN p_variant_id = 'rgb-25' THEN variant_length := 25;
      WHEN p_variant_id = 'rgb-30' THEN variant_length := 30;
      ELSE variant_length := 5;
    END CASE;
    
    -- Calculate price based on length ratio
    IF p_variant_id = 'rgb-5' THEN
      calculated_price := policy_price;
    ELSE
      calculated_price := policy_price * (variant_length::numeric / base_length::numeric);
      calculated_price := round(calculated_price);
    END IF;
    
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
  
  -- If found with price_multiplier, calculate based on product price
  IF policy_multiplier IS NOT NULL THEN
    -- Get base product price for calculation
    SELECT get_product_price(p_product_id, p_variant_id, p_currency) INTO base_product_price;
    
    -- Calculate warranty price
    calculated_price := base_product_price * policy_multiplier;
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
  
  -- If nothing found, return 0
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all warranty prices for admin panel with variant filter
CREATE OR REPLACE FUNCTION get_all_warranty_prices_by_variant(
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
  warranty_id uuid;
  variant_length integer;
  base_length integer := 5;
  base_price numeric;
  calculated_price numeric;
  v_id text;
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
      
      -- Also update prices for other variants based on length ratio
      DECLARE
        variant_ids text[] := ARRAY['rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
      BEGIN
        FOREACH v_id IN ARRAY variant_ids
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
          calculated_price := p_price * (variant_length::numeric / base_length::numeric);
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
          )
          ON CONFLICT DO NOTHING;
        END LOOP;
      END;
    END IF;
  END IF;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster warranty price lookups
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
  FOR policy IN SELECT * FROM warranty_policies
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

-- Update price-utils.ts function to support variant-specific warranty prices
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