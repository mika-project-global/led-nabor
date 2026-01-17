/*
  # Fix warranty pricing for all product variants
  
  1. Changes
    - Fix the issue with warranty prices not scaling correctly for variants larger than 5 meters
    - Ensure prices are properly calculated for each variant
    - Add improved functions for retrieving and updating prices
    - Fix synchronization between tables
    
  2. Security
    - Maintain existing RLS policies
*/

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
  -- Extract length from variant ID (e.g., 'rgb-10' -> 10)
  CASE 
    WHEN p_variant_id = 'rgb-5' THEN variant_length := 5;
    WHEN p_variant_id = 'rgb-10' THEN variant_length := 10;
    WHEN p_variant_id = 'rgb-15' THEN variant_length := 15;
    WHEN p_variant_id = 'rgb-20' THEN variant_length := 20;
    WHEN p_variant_id = 'rgb-25' THEN variant_length := 25;
    WHEN p_variant_id = 'rgb-30' THEN variant_length := 30;
    WHEN p_variant_id = 'cct-5' THEN variant_length := 5;
    WHEN p_variant_id = 'cct-10' THEN variant_length := 10;
    WHEN p_variant_id = 'cct-15' THEN variant_length := 15;
    WHEN p_variant_id = 'cct-20' THEN variant_length := 20;
    WHEN p_variant_id = 'cct-25' THEN variant_length := 25;
    WHEN p_variant_id = 'cct-30' THEN variant_length := 30;
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
  SELECT wcp.custom_price INTO default_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = 'rgb-5'
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  -- If not found, try from warranty_fixed_prices
  IF default_price IS NULL THEN
    SELECT wfp.price INTO default_price
    FROM warranty_fixed_prices wfp
    WHERE wfp.product_id = p_product_id
      AND wfp.months = p_months
      AND wfp.currency = p_currency;
  END IF;
  
  -- If still not found, try from warranty_policies
  IF default_price IS NULL THEN
    SELECT wp.fixed_price INTO default_price
    FROM warranty_policies wp
    WHERE wp.product_id = p_product_id
      AND wp.months = p_months;
  END IF;
  
  -- If we found a base price, calculate the price for this variant
  IF default_price IS NOT NULL THEN
    -- For 5m variant, return the base price
    IF variant_length = 5 THEN
      RETURN default_price;
    ELSE
      -- For other variants, scale the price based on length ratio
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

-- Create function to update warranty price with proper variant handling
CREATE OR REPLACE FUNCTION update_warranty_price_with_variant(
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
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30', 'cct-5', 'cct-10', 'cct-15', 'cct-20', 'cct-25', 'cct-30'];
  product_prefix text;
BEGIN
  -- Determine product prefix (rgb or cct)
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM products p, jsonb_array_elements(p.variants) AS v
        WHERE p.id = p_product_id AND v->>'id' LIKE 'rgb-%'
      ) THEN 'rgb'
      ELSE 'cct'
    END INTO product_prefix;

  -- If updating the base variant, update all variants
  IF p_variant_id = product_prefix || '-5' THEN
    -- First update the base price for 5m variant
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
    
    -- Now update all other variants for this product
    FOREACH v_id IN ARRAY variants
    LOOP
      -- Skip if not matching product prefix or already updated
      IF v_id != p_variant_id AND v_id LIKE product_prefix || '-%' THEN
        -- Extract length from variant ID
        CASE 
          WHEN v_id LIKE '%-5' THEN variant_length := 5;
          WHEN v_id LIKE '%-10' THEN variant_length := 10;
          WHEN v_id LIKE '%-15' THEN variant_length := 15;
          WHEN v_id LIKE '%-20' THEN variant_length := 20;
          WHEN v_id LIKE '%-25' THEN variant_length := 25;
          WHEN v_id LIKE '%-30' THEN variant_length := 30;
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

-- Create function to fix all warranty prices
CREATE OR REPLACE FUNCTION fix_all_warranty_prices() RETURNS void AS $$
DECLARE
  policy RECORD;
  product RECORD;
  variant RECORD;
  base_price numeric;
  variant_price numeric;
  variant_length integer;
  base_length integer := 5;
  processed_keys text[];
BEGIN
  -- First, deactivate all existing warranty_custom_prices
  UPDATE warranty_custom_prices SET is_active = false;
  
  -- For each product
  FOR product IN SELECT * FROM products
  LOOP
    -- For each warranty policy
    FOR policy IN 
      SELECT * FROM warranty_policies
      WHERE product_id = product.id
        AND fixed_price IS NOT NULL 
        AND fixed_price > 0
    LOOP
      -- Get the base price
      base_price := policy.fixed_price;
      
      -- For each variant
      FOR variant IN 
        SELECT * FROM jsonb_to_recordset(product.variants) AS x(id text, length integer, price numeric)
      LOOP
        -- Extract length from variant ID
        variant_length := variant.length;
        
        -- Calculate price based on length ratio
        IF variant_length = 5 THEN
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
          product.id,
          variant.id,
          policy.months,
          'CZK',
          variant_price,
          true,
          clock_timestamp()
        );
      END LOOP;
    END LOOP;
  END LOOP;
  
  -- Update warranty_fixed_prices from warranty_custom_prices
  -- Use a temporary table to avoid the ON CONFLICT DO UPDATE error
  CREATE TEMP TABLE temp_warranty_fixed_prices AS
  SELECT DISTINCT ON (product_id, months, currency)
    product_id,
    months,
    currency,
    custom_price AS price
  FROM 
    warranty_custom_prices
  WHERE 
    is_active = true AND
    (variant_id = 'rgb-5' OR variant_id = 'cct-5')
  ORDER BY 
    product_id, months, currency, updated_at DESC;
  
  -- Now insert from the temp table
  INSERT INTO warranty_fixed_prices (
    product_id,
    months,
    currency,
    price
  )
  SELECT 
    product_id,
    months,
    currency,
    price
  FROM 
    temp_warranty_fixed_prices
  ON CONFLICT (product_id, months, currency) 
  DO UPDATE SET price = EXCLUDED.price;
  
  -- Drop the temporary table
  DROP TABLE temp_warranty_fixed_prices;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to fix all product prices
CREATE OR REPLACE FUNCTION fix_all_product_prices() RETURNS void AS $$
DECLARE
  product RECORD;
  variant RECORD;
BEGIN
  -- First, deactivate all existing product_prices
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get warranty prices with variant support
CREATE OR REPLACE FUNCTION get_warranty_prices_with_variant(
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
        WHEN p_variant_id LIKE '%-5' THEN COALESCE(wp.fixed_price, 0)
        WHEN p_variant_id LIKE '%-10' THEN COALESCE(wp.fixed_price, 0) * 2
        WHEN p_variant_id LIKE '%-15' THEN COALESCE(wp.fixed_price, 0) * 3
        WHEN p_variant_id LIKE '%-20' THEN COALESCE(wp.fixed_price, 0) * 4
        WHEN p_variant_id LIKE '%-25' THEN COALESCE(wp.fixed_price, 0) * 5
        WHEN p_variant_id LIKE '%-30' THEN COALESCE(wp.fixed_price, 0) * 6
        ELSE COALESCE(wp.fixed_price, 0)
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

-- Run the fix functions to ensure all prices are properly synchronized
SELECT fix_all_product_prices();
SELECT fix_all_warranty_prices();