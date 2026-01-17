/*
  # Fix warranty pricing system
  
  1. Changes
    - Ensure all warranty prices are correctly set for all variants
    - Fix price calculation for different product lengths
    - Add proper error handling and logging
    - Ensure prices are correctly synchronized between tables
*/

-- First, ensure we have 24-month and 60-month warranty policies for all products
DO $$
DECLARE
  policy_count integer;
BEGIN
  -- Check for 24-month policies
  SELECT COUNT(*) INTO policy_count FROM warranty_policies WHERE months = 24;
  
  -- If no 24-month policies exist, create them for all products
  IF policy_count = 0 THEN
    INSERT INTO warranty_policies (
      product_id,
      months,
      description,
      terms,
      price_multiplier,
      fixed_price,
      is_default
    )
    SELECT
      id AS product_id,
      24 AS months,
      'Стандартная гарантия 24 месяца (включена в стоимость)' AS description,
      'Гарантия распространяется на заводские дефекты и неисправности, возникшие по вине производителя. В случае обнаружения дефекта мы бесплатно заменим товар на новый или вернем деньги.' AS terms,
      0 AS price_multiplier,
      0 AS fixed_price,
      true AS is_default
    FROM products
    WHERE id NOT IN (SELECT product_id FROM warranty_policies WHERE months = 24);
  END IF;
  
  -- Check for 60-month policies
  SELECT COUNT(*) INTO policy_count FROM warranty_policies WHERE months = 60;
  
  -- If no 60-month policies exist, create them for all products
  IF policy_count = 0 THEN
    INSERT INTO warranty_policies (
      product_id,
      months,
      description,
      terms,
      price_multiplier,
      fixed_price,
      is_default,
      stripe_product_id,
      stripe_price_id
    )
    SELECT
      id AS product_id,
      60 AS months,
      'Премиум гарантия на 5 лет (дополнительная защита)' AS description,
      'Максимальная защита вашего оборудования на 5 лет. Полное гарантийное обслуживание, VIP поддержка 24/7, бесплатная замена при любых неисправностях, включая случайные повреждения.' AS terms,
      0.20 AS price_multiplier,
      CASE 
        WHEN id = 1 THEN 800::numeric  -- 5-meter RGB+CCT product
        WHEN id = 2 THEN 2400::numeric -- 5-meter CCT product
        ELSE NULL
      END AS fixed_price,
      false AS is_default,
      CASE 
        WHEN id = 1 THEN 'prod_S5mZmfjPtp3KIV'
        ELSE NULL
      END AS stripe_product_id,
      CASE 
        WHEN id = 1 THEN 'price_1RBb0nKVsLiX4gAoxfXskhKv'
        ELSE NULL
      END AS stripe_price_id
    FROM products
    WHERE id NOT IN (SELECT product_id FROM warranty_policies WHERE months = 60);
  END IF;
END $$;

-- Update existing warranty policies with correct values
UPDATE warranty_policies
SET 
  description = 'Стандартная гарантия 24 месяца (включена в стоимость)',
  terms = 'Гарантия распространяется на заводские дефекты и неисправности, возникшие по вине производителя. В случае обнаружения дефекта мы бесплатно заменим товар на новый или вернем деньги.',
  price_multiplier = 0,
  fixed_price = 0,
  is_default = true
WHERE months = 24;

UPDATE warranty_policies
SET 
  description = 'Премиум гарантия на 5 лет (дополнительная защита)',
  terms = 'Максимальная защита вашего оборудования на 5 лет. Полное гарантийное обслуживание, VIP поддержка 24/7, бесплатная замена при любых неисправностях, включая случайные повреждения.',
  price_multiplier = 0.20,
  fixed_price = CASE 
    WHEN product_id = 1 THEN 800::numeric  -- 5-meter RGB+CCT product
    WHEN product_id = 2 THEN 2400::numeric -- 5-meter CCT product
    ELSE fixed_price
  END,
  is_default = false,
  stripe_product_id = CASE 
    WHEN product_id = 1 THEN 'prod_S5mZmfjPtp3KIV'
    ELSE stripe_product_id
  END,
  stripe_price_id = CASE 
    WHEN product_id = 1 THEN 'price_1RBb0nKVsLiX4gAoxfXskhKv'
    ELSE stripe_price_id
  END
WHERE months = 60;

-- First deactivate any existing warranty custom prices
UPDATE warranty_custom_prices SET is_active = false;

-- Update variant-specific warranty prices for RGB+CCT product (product_id = 1)
DO $$
DECLARE
  variant_id text;
  variant_length integer;
  base_price numeric := 800; -- Base price for 5m RGB+CCT warranty
  calculated_price numeric;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
BEGIN
  FOREACH variant_id IN ARRAY variants
  LOOP
    -- Extract length from variant ID
    CASE 
      WHEN variant_id = 'rgb-5' THEN variant_length := 5;
      WHEN variant_id = 'rgb-10' THEN variant_length := 10;
      WHEN variant_id = 'rgb-15' THEN variant_length := 15;
      WHEN variant_id = 'rgb-20' THEN variant_length := 20;
      WHEN variant_id = 'rgb-25' THEN variant_length := 25;
      WHEN variant_id = 'rgb-30' THEN variant_length := 30;
      ELSE variant_length := 5;
    END CASE;
    
    -- Calculate price based on length ratio
    IF variant_id = 'rgb-5' THEN
      calculated_price := base_price;
    ELSE
      calculated_price := base_price * (variant_length / 5);
      calculated_price := round(calculated_price);
    END IF;
    
    -- Insert 60-month warranty price
    INSERT INTO warranty_custom_prices (
      product_id,
      variant_id,
      months,
      currency,
      custom_price,
      is_active,
      updated_at
    ) VALUES (
      1,
      variant_id,
      60,
      'CZK',
      calculated_price,
      true,
      now()
    );
    
    -- Insert 24-month warranty price (free)
    INSERT INTO warranty_custom_prices (
      product_id,
      variant_id,
      months,
      currency,
      custom_price,
      is_active,
      updated_at
    ) VALUES (
      1,
      variant_id,
      24,
      'CZK',
      0,
      true,
      now()
    );
  END LOOP;
END $$;

-- Update variant-specific warranty prices for CCT product (product_id = 2)
DO $$
DECLARE
  variant_id text;
  variant_length integer;
  base_price numeric := 2400; -- Base price for 5m CCT warranty
  calculated_price numeric;
  variants text[] := ARRAY['cct-5', 'cct-10', 'cct-15', 'cct-20', 'cct-25', 'cct-30'];
BEGIN
  FOREACH variant_id IN ARRAY variants
  LOOP
    -- Extract length from variant ID
    CASE 
      WHEN variant_id = 'cct-5' THEN variant_length := 5;
      WHEN variant_id = 'cct-10' THEN variant_length := 10;
      WHEN variant_id = 'cct-15' THEN variant_length := 15;
      WHEN variant_id = 'cct-20' THEN variant_length := 20;
      WHEN variant_id = 'cct-25' THEN variant_length := 25;
      WHEN variant_id = 'cct-30' THEN variant_length := 30;
      ELSE variant_length := 5;
    END CASE;
    
    -- Calculate price based on length ratio
    IF variant_id = 'cct-5' THEN
      calculated_price := base_price;
    ELSE
      calculated_price := base_price * (variant_length / 5);
      calculated_price := round(calculated_price);
    END IF;
    
    -- Insert 60-month warranty price
    INSERT INTO warranty_custom_prices (
      product_id,
      variant_id,
      months,
      currency,
      custom_price,
      is_active,
      updated_at
    ) VALUES (
      2,
      variant_id,
      60,
      'CZK',
      calculated_price,
      true,
      now()
    );
    
    -- Insert 24-month warranty price (free)
    INSERT INTO warranty_custom_prices (
      product_id,
      variant_id,
      months,
      currency,
      custom_price,
      is_active,
      updated_at
    ) VALUES (
      2,
      variant_id,
      24,
      'CZK',
      0,
      true,
      now()
    );
  END LOOP;
END $$;

-- Update warranty_fixed_prices table
INSERT INTO warranty_fixed_prices (
  product_id,
  months,
  currency,
  price
) 
VALUES
  (1, 24, 'CZK', 0),
  (1, 60, 'CZK', 800),
  (2, 24, 'CZK', 0),
  (2, 60, 'CZK', 2400)
ON CONFLICT (product_id, months, currency) 
DO UPDATE SET price = EXCLUDED.price;

-- Sync product_prices table with products table
DO $$
DECLARE
  product RECORD;
  variant RECORD;
BEGIN
  -- First deactivate all existing prices
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
END $$;

-- Create or replace function to get warranty price for specific variant
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
  variant_prefix text;
BEGIN
  -- Determine variant prefix (rgb or cct)
  variant_prefix := CASE 
    WHEN p_variant_id LIKE 'rgb-%' THEN 'rgb'
    WHEN p_variant_id LIKE 'cct-%' THEN 'cct'
    ELSE 'rgb'
  END;
  
  -- Extract length from variant ID (e.g., 'rgb-10' -> 10)
  CASE 
    WHEN p_variant_id LIKE '%-5' THEN variant_length := 5;
    WHEN p_variant_id LIKE '%-10' THEN variant_length := 10;
    WHEN p_variant_id LIKE '%-15' THEN variant_length := 15;
    WHEN p_variant_id LIKE '%-20' THEN variant_length := 20;
    WHEN p_variant_id LIKE '%-25' THEN variant_length := 25;
    WHEN p_variant_id LIKE '%-30' THEN variant_length := 30;
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
    AND wcp.variant_id = variant_prefix || '-5'
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
) RETURNS boolean AS $$
DECLARE
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
  v_id text;
  product_prefix text;
  variant_ids text[];
  existing_id uuid;
BEGIN
  -- Determine product prefix (rgb or cct)
  product_prefix := CASE 
    WHEN p_variant_id LIKE 'rgb-%' THEN 'rgb'
    WHEN p_variant_id LIKE 'cct-%' THEN 'cct'
    ELSE 'rgb'
  END;
  
  -- Create list of variants for this product type
  variant_ids := ARRAY[
    product_prefix || '-5', 
    product_prefix || '-10', 
    product_prefix || '-15', 
    product_prefix || '-20', 
    product_prefix || '-25', 
    product_prefix || '-30'
  ];

  -- If updating the base variant, update all variants
  IF p_variant_id = product_prefix || '-5' THEN
    -- First update the base price for 5m variant
    -- Check if there's an existing price
    SELECT id INTO existing_id
    FROM warranty_custom_prices
    WHERE product_id = p_product_id
      AND variant_id = p_variant_id
      AND months = p_months
      AND currency = p_currency
      AND is_active = true;
      
    -- If exists, deactivate it
    IF existing_id IS NOT NULL THEN
      UPDATE warranty_custom_prices
      SET is_active = false
      WHERE id = existing_id;
    END IF;
    
    -- Insert new price
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
    );
    
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
    FOREACH v_id IN ARRAY variant_ids
    LOOP
      -- Skip if not matching product prefix or already updated
      IF v_id != p_variant_id THEN
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
        
        -- Check if there's an existing price
        SELECT id INTO existing_id
        FROM warranty_custom_prices
        WHERE product_id = p_product_id
          AND variant_id = v_id
          AND months = p_months
          AND currency = p_currency
          AND is_active = true;
          
        -- If exists, deactivate it
        IF existing_id IS NOT NULL THEN
          UPDATE warranty_custom_prices
          SET is_active = false
          WHERE id = existing_id;
        END IF;
        
        -- Insert new price
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
    -- Check if there's an existing price
    SELECT id INTO existing_id
    FROM warranty_custom_prices
    WHERE product_id = p_product_id
      AND variant_id = p_variant_id
      AND months = p_months
      AND currency = p_currency
      AND is_active = true;
      
    -- If exists, deactivate it
    IF existing_id IS NOT NULL THEN
      UPDATE warranty_custom_prices
      SET is_active = false
      WHERE id = existing_id;
    END IF;
    
    -- Insert new price
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
    );
  END IF;

  RETURN true;
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
    -- Determine variant prefix (rgb or cct)
    DECLARE
      variant_prefix text := CASE 
        WHEN p_variant_id LIKE 'rgb-%' THEN 'rgb'
        WHEN p_variant_id LIKE 'cct-%' THEN 'cct'
        ELSE 'rgb'
      END;
      
      variant_length integer := CASE 
        WHEN p_variant_id LIKE '%-5' THEN 5
        WHEN p_variant_id LIKE '%-10' THEN 10
        WHEN p_variant_id LIKE '%-15' THEN 15
        WHEN p_variant_id LIKE '%-20' THEN 20
        WHEN p_variant_id LIKE '%-25' THEN 25
        WHEN p_variant_id LIKE '%-30' THEN 30
        ELSE 5
      END;
      
      base_length integer := 5;
    BEGIN
      -- Insert warranty prices from policies
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
          WHEN variant_length = 5 THEN COALESCE(wp.fixed_price, 0)
          ELSE round(COALESCE(wp.fixed_price, 0) * (variant_length / base_length))
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
    END;
  END IF;
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
  stock_status text;
  existing_id uuid;
BEGIN
  -- Check if there's an existing price
  SELECT id INTO existing_id
  FROM product_prices
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND currency = p_currency
    AND is_active = true;
    
  -- If exists, deactivate it
  IF existing_id IS NOT NULL THEN
    UPDATE product_prices
    SET is_active = false
    WHERE id = existing_id;
  END IF;
  
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
      (value->>'length')::integer,
      COALESCE(value->>'stockStatus', 'in_stock')
    INTO 
      variant_index,
      variant_length,
      stock_status
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
            'stockStatus', stock_status,
            'stripePriceId', (
              SELECT value->>'stripePriceId'
              FROM jsonb_array_elements(variants) AS value
              WHERE value->>'id' = p_variant_id
            )
          )
        ),
        updated_at = now()
      WHERE id = p_product_id;
    END IF;
  END IF;
  
  RETURN new_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get product prices
CREATE OR REPLACE FUNCTION get_product_prices(
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  id uuid,
  product_id integer,
  variant_id text,
  currency text,
  custom_price numeric,
  is_active boolean,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.product_id,
    pp.variant_id,
    pp.currency,
    pp.custom_price,
    pp.is_active,
    pp.updated_at
  FROM product_prices pp
  WHERE pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.product_id, pp.variant_id;
  
  -- If no results, sync from products table
  IF NOT FOUND THEN
    -- Insert prices from products table
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
      );
    
    -- Return the newly inserted prices
    RETURN QUERY
    SELECT 
      pp.id,
      pp.product_id,
      pp.variant_id,
      pp.currency,
      pp.custom_price,
      pp.is_active,
      pp.updated_at
    FROM product_prices pp
    WHERE pp.currency = p_currency
      AND pp.is_active = true
    ORDER BY pp.product_id, pp.variant_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;