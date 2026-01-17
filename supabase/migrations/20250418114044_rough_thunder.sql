/*
  # Fix product display and warranty pricing
  
  1. Changes
    - Ensure products table has correct data
    - Fix warranty pricing for different product lengths
    - Update default warranty settings
    - Add proper Stripe integration for all variants
*/

-- First, ensure the products table exists and has the correct data
DO $$
BEGIN
  -- Check if products table is empty
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    -- Insert default products
    INSERT INTO products (id, name, variants)
    VALUES 
      (1, 'Универсальный RGB+CCT набор', '[
        {"id": "rgb-5", "length": 5, "price": 5350, "stockStatus": "in_stock", "stripePriceId": "price_1RBavEKVsLiX4gAoLBIsBRBo"},
        {"id": "rgb-10", "length": 10, "price": 28000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAomT9VrbqX"},
        {"id": "rgb-15", "length": 15, "price": 40000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAoQ0cuYJsk"},
        {"id": "rgb-20", "length": 20, "price": 52000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAozb3L9C27"},
        {"id": "rgb-25", "length": 25, "price": 65000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAo1AKFafc4"},
        {"id": "rgb-30", "length": 30, "price": 78000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAobmHtjdwa"}
      ]'::jsonb),
      (2, 'Белая CCT подсветка', '[
        {"id": "cct-5", "length": 5, "price": 12000, "stockStatus": "in_stock"},
        {"id": "cct-10", "length": 10, "price": 22000, "stockStatus": "in_stock"},
        {"id": "cct-15", "length": 15, "price": 32000, "stockStatus": "in_stock"},
        {"id": "cct-20", "length": 20, "price": 42000, "stockStatus": "in_stock"},
        {"id": "cct-25", "length": 25, "price": 52000, "stockStatus": "in_stock"},
        {"id": "cct-30", "length": 30, "price": 62000, "stockStatus": "in_stock"}
      ]'::jsonb);
  ELSE
    -- Update existing products with correct data
    UPDATE products
    SET variants = '[
      {"id": "rgb-5", "length": 5, "price": 5350, "stockStatus": "in_stock", "stripePriceId": "price_1RBavEKVsLiX4gAoLBIsBRBo"},
      {"id": "rgb-10", "length": 10, "price": 28000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAomT9VrbqX"},
      {"id": "rgb-15", "length": 15, "price": 40000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAoQ0cuYJsk"},
      {"id": "rgb-20", "length": 20, "price": 52000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAozb3L9C27"},
      {"id": "rgb-25", "length": 25, "price": 65000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAo1AKFafc4"},
      {"id": "rgb-30", "length": 30, "price": 78000, "stockStatus": "in_stock", "stripePriceId": "price_1R44iWKVsLiX4gAobmHtjdwa"}
    ]'::jsonb
    WHERE id = 1;
    
    UPDATE products
    SET variants = '[
      {"id": "cct-5", "length": 5, "price": 12000, "stockStatus": "in_stock"},
      {"id": "cct-10", "length": 10, "price": 22000, "stockStatus": "in_stock"},
      {"id": "cct-15", "length": 15, "price": 32000, "stockStatus": "in_stock"},
      {"id": "cct-20", "length": 20, "price": 42000, "stockStatus": "in_stock"},
      {"id": "cct-25", "length": 25, "price": 52000, "stockStatus": "in_stock"},
      {"id": "cct-30", "length": 30, "price": 62000, "stockStatus": "in_stock"}
    ]'::jsonb
    WHERE id = 2;
  END IF;
END $$;

-- Ensure we have 24-month and 60-month warranty policies for all products
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