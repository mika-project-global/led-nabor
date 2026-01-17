/*
  # Fix pricing system conflicts
  
  1. Changes
    - Fix conflicts between multiple migrations
    - Ensure proper synchronization between tables
    - Fix variant-specific warranty pricing
    - Add debugging functions to identify issues
    
  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing functions that cause conflicts
DROP FUNCTION IF EXISTS get_warranty_prices_by_variant(text, text);
DROP FUNCTION IF EXISTS update_warranty_price_for_variant(integer, integer, text, numeric, text);

-- Create function to debug warranty pricing
CREATE OR REPLACE FUNCTION debug_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK',
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS TABLE (
  source text,
  price numeric,
  details jsonb
) AS $$
DECLARE
  custom_price numeric;
  default_price numeric;
  fixed_price numeric;
  policy_price numeric;
  policy_multiplier numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
BEGIN
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

  -- Check warranty_custom_prices table
  SELECT wcp.custom_price INTO custom_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = p_variant_id
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  IF custom_price IS NOT NULL THEN
    RETURN QUERY SELECT 
      'warranty_custom_prices'::text, 
      custom_price,
      jsonb_build_object(
        'product_id', p_product_id,
        'variant_id', p_variant_id,
        'months', p_months,
        'currency', p_currency
      );
    RETURN;
  END IF;
  
  -- Check default variant in warranty_custom_prices
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
    
    IF default_price IS NOT NULL THEN
      calculated_price := default_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      RETURN QUERY SELECT 
        'warranty_custom_prices (scaled from default)'::text, 
        calculated_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'base_variant_id', 'rgb-5',
          'target_variant_id', p_variant_id,
          'months', p_months,
          'currency', p_currency,
          'base_price', default_price,
          'scale_factor', variant_length / base_length
        );
      RETURN;
    END IF;
  END IF;
  
  -- Check warranty_fixed_prices table
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  IF fixed_price IS NOT NULL THEN
    IF p_variant_id = 'rgb-5' THEN
      RETURN QUERY SELECT 
        'warranty_fixed_prices'::text, 
        fixed_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'months', p_months,
          'currency', p_currency
        );
    ELSE
      calculated_price := fixed_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      RETURN QUERY SELECT 
        'warranty_fixed_prices (scaled)'::text, 
        calculated_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'months', p_months,
          'currency', p_currency,
          'base_price', fixed_price,
          'scale_factor', variant_length / base_length
        );
    END IF;
    RETURN;
  END IF;
  
  -- Check warranty_policies table
  SELECT wp.fixed_price, wp.price_multiplier INTO policy_price, policy_multiplier
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  IF policy_price IS NOT NULL THEN
    IF p_variant_id = 'rgb-5' THEN
      RETURN QUERY SELECT 
        'warranty_policies (fixed_price)'::text, 
        policy_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'months', p_months
        );
    ELSE
      calculated_price := policy_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      RETURN QUERY SELECT 
        'warranty_policies (fixed_price, scaled)'::text, 
        calculated_price,
        jsonb_build_object(
          'product_id', p_product_id,
          'months', p_months,
          'base_price', policy_price,
          'scale_factor', variant_length / base_length
        );
    END IF;
    RETURN;
  END IF;
  
  -- If nothing found, return 0
  RETURN QUERY SELECT 
    'no price found'::text, 
    0::numeric,
    jsonb_build_object(
      'product_id', p_product_id,
      'variant_id', p_variant_id,
      'months', p_months,
      'currency', p_currency
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to debug product pricing
CREATE OR REPLACE FUNCTION debug_product_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  source text,
  price numeric,
  details jsonb
) AS $$
DECLARE
  custom_price numeric;
  product_price numeric;
BEGIN
  -- Check product_prices table
  SELECT pp.custom_price INTO custom_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;
  
  IF custom_price IS NOT NULL THEN
    RETURN QUERY SELECT 
      'product_prices'::text, 
      custom_price,
      jsonb_build_object(
        'product_id', p_product_id,
        'variant_id', p_variant_id,
        'currency', p_currency
      );
    RETURN;
  END IF;
  
  -- Check products table
  SELECT (value->>'price')::numeric INTO product_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;
  
  IF product_price IS NOT NULL THEN
    RETURN QUERY SELECT 
      'products table'::text, 
      product_price,
      jsonb_build_object(
        'product_id', p_product_id,
        'variant_id', p_variant_id
      );
    RETURN;
  END IF;
  
  -- If nothing found, return 0
  RETURN QUERY SELECT 
    'no price found'::text, 
    0::numeric,
    jsonb_build_object(
      'product_id', p_product_id,
      'variant_id', p_variant_id,
      'currency', p_currency
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to fix all warranty prices
CREATE OR REPLACE FUNCTION fix_all_warranty_prices() RETURNS void AS $$
DECLARE
  policy RECORD;
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
  base_price numeric;
  variant_price numeric;
  variant_length integer;
  base_length integer := 5;
BEGIN
  -- First, clear all existing warranty_custom_prices
  UPDATE warranty_custom_prices SET is_active = false;
  
  -- For each warranty policy
  FOR policy IN 
    SELECT * FROM warranty_policies
    WHERE fixed_price IS NOT NULL AND fixed_price > 0
  LOOP
    -- Get the base price
    base_price := policy.fixed_price;
    
    -- For each variant
    FOREACH v_id IN ARRAY variants
    LOOP
      -- Extract length from variant ID
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
        variant_price := base_price * (variant_length / base_length);
        variant_price := round(variant_price);
      END IF;
      
      -- Insert price record
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
      
      -- Also insert for other currencies if needed
      INSERT INTO warranty_custom_prices (
        product_id,
        variant_id,
        months,
        currency,
        custom_price,
        is_active,
        updated_at
      )
      SELECT
        policy.product_id,
        v_id,
        policy.months,
        wfp.currency,
        CASE 
          WHEN v_id = 'rgb-5' THEN wfp.price
          ELSE round(wfp.price * (variant_length / base_length))
        END,
        true,
        clock_timestamp()
      FROM warranty_fixed_prices wfp
      WHERE wfp.product_id = policy.product_id
        AND wfp.months = policy.months
        AND wfp.currency != 'CZK'
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
  
  -- Update warranty_fixed_prices from warranty_custom_prices
  INSERT INTO warranty_fixed_prices (
    product_id,
    months,
    currency,
    price
  )
  SELECT 
    wcp.product_id,
    wcp.months,
    wcp.currency,
    wcp.custom_price
  FROM 
    warranty_custom_prices wcp
  WHERE 
    wcp.is_active = true AND
    wcp.variant_id = 'rgb-5'
  ON CONFLICT (product_id, months, currency) 
  DO UPDATE SET price = EXCLUDED.price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to fix all product prices
CREATE OR REPLACE FUNCTION fix_all_product_prices() RETURNS void AS $$
DECLARE
  product RECORD;
  variant RECORD;
BEGIN
  -- First, clear all existing product_prices
  UPDATE product_prices SET is_active = false;
  
  -- For each product
  FOR product IN SELECT * FROM products
  LOOP
    -- For each variant
    FOR variant IN SELECT * FROM jsonb_to_recordset(product.variants) AS x(id text, length integer, price numeric, stockStatus text)
    LOOP
      -- Insert price record
      INSERT INTO product_prices (
        product_id,
        variant_id,
        currency,
        custom_price,
        is_active,
        updated_at
      ) VALUES (
        product.id,
        variant.id,
        'CZK',
        variant.price,
        true,
        clock_timestamp()
      );
    END LOOP;
  END LOOP;
  
  -- Update products table from product_prices
  UPDATE products p
  SET variants = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', v->>'id',
        'length', (v->>'length')::integer,
        'price', COALESCE(pp.custom_price, (v->>'price')::numeric),
        'stockStatus', v->>'stockStatus'
      )
    )
    FROM jsonb_array_elements(p.variants) AS v
    LEFT JOIN product_prices pp ON 
      pp.product_id = p.id AND 
      pp.variant_id = v->>'id' AND 
      pp.currency = 'CZK' AND
      pp.is_active = true
  )
  WHERE EXISTS (
    SELECT 1 
    FROM product_prices pp 
    WHERE pp.product_id = p.id AND pp.currency = 'CZK' AND pp.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved function to get warranty price for specific variant
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
      calculated_price := default_price * (variant_length / base_length);
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
      calculated_price := fixed_price * (variant_length / base_length);
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
      calculated_price := policy_price * (variant_length / base_length);
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

-- Create function to get product price with proper fallback
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

-- Create function to update product price with proper synchronization
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
            'price', p_price,
            'stockStatus', 'in_stock'
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

-- Create new function for warranty prices by variant with a different name to avoid conflicts
CREATE FUNCTION get_warranty_prices_with_variant(
  p_currency text,
  p_variant_id text
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
      CASE 
        WHEN p_variant_id = 'rgb-5' THEN COALESCE(wp.fixed_price, 0)
        ELSE 
          CASE 
            WHEN p_variant_id = 'rgb-10' THEN COALESCE(wp.fixed_price, 0) * 2
            WHEN p_variant_id = 'rgb-15' THEN COALESCE(wp.fixed_price, 0) * 3
            WHEN p_variant_id = 'rgb-20' THEN COALESCE(wp.fixed_price, 0) * 4
            WHEN p_variant_id = 'rgb-25' THEN COALESCE(wp.fixed_price, 0) * 5
            WHEN p_variant_id = 'rgb-30' THEN COALESCE(wp.fixed_price, 0) * 6
            ELSE COALESCE(wp.fixed_price, 0)
          END
      END,
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

-- Create new function for updating warranty price with a different name to avoid conflicts
CREATE FUNCTION update_warranty_price_with_variant(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric,
  p_variant_id text
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
BEGIN
  -- If updating the base variant, update all variants
  IF p_variant_id = 'rgb-5' THEN
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
      SET 
        fixed_price = p_price,
        updated_at = now()
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
  END IF;

  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the fix functions to ensure all prices are properly synchronized
SELECT fix_all_product_prices();
SELECT fix_all_warranty_prices();