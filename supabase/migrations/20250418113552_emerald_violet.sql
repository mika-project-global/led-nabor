/*
  # Fix warranty pricing system
  
  1. Changes
    - Add 60-month warranty policies for all products
    - Set correct prices for different product lengths
    - Ensure 24-month warranty is marked as default
    - Fix ON CONFLICT issues by using DO blocks
    
  2. Security
    - Maintain existing RLS policies
*/

-- First, ensure we have 60-month warranty policies for all products
DO $$
DECLARE
  policy_count integer;
BEGIN
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
      'Премиум гарантия на 5 лет' AS description,
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
    FROM products;
  END IF;
END $$;

-- Update existing 60-month warranty policies with correct values
UPDATE warranty_policies
SET 
  description = 'Премиум гарантия на 5 лет',
  terms = 'Максимальная защита вашего оборудования на 5 лет. Полное гарантийное обслуживание, VIP поддержка 24/7, бесплатная замена при любых неисправностях, включая случайные повреждения.',
  price_multiplier = 0.20,
  fixed_price = CASE 
    WHEN product_id = 1 THEN 800::numeric  -- 5-meter RGB+CCT product
    WHEN product_id = 2 THEN 2400::numeric -- 5-meter CCT product
    ELSE fixed_price
  END,
  stripe_product_id = CASE 
    WHEN product_id = 1 THEN 'prod_S5mZmfjPtp3KIV'
    ELSE stripe_product_id
  END,
  stripe_price_id = CASE 
    WHEN product_id = 1 THEN 'price_1RBb0nKVsLiX4gAoxfXskhKv'
    ELSE stripe_price_id
  END
WHERE months = 60;

-- Ensure 24-month warranty policies are marked as default
UPDATE warranty_policies
SET is_default = true
WHERE months = 24;

-- Ensure 60-month warranty policies are NOT marked as default
UPDATE warranty_policies
SET is_default = false
WHERE months = 60;

-- First deactivate any existing warranty custom prices for 60-month warranties
UPDATE warranty_custom_prices
SET is_active = false
WHERE months = 60;

-- Update variant-specific warranty prices for RGB+CCT product (product_id = 1)
DO $$
BEGIN
  -- 5-meter RGB+CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 1 AND variant_id = 'rgb-5' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (1, 'rgb-5', 60, 'CZK', 800, true, now());
  
  -- 10-meter RGB+CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 1 AND variant_id = 'rgb-10' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (1, 'rgb-10', 60, 'CZK', 1600, true, now());
  
  -- 15-meter RGB+CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 1 AND variant_id = 'rgb-15' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (1, 'rgb-15', 60, 'CZK', 2400, true, now());
  
  -- 20-meter RGB+CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 1 AND variant_id = 'rgb-20' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (1, 'rgb-20', 60, 'CZK', 3200, true, now());
  
  -- 25-meter RGB+CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 1 AND variant_id = 'rgb-25' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (1, 'rgb-25', 60, 'CZK', 4000, true, now());
  
  -- 30-meter RGB+CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 1 AND variant_id = 'rgb-30' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (1, 'rgb-30', 60, 'CZK', 4800, true, now());
END $$;

-- Update variant-specific warranty prices for CCT product (product_id = 2)
DO $$
BEGIN
  -- 5-meter CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 2 AND variant_id = 'cct-5' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (2, 'cct-5', 60, 'CZK', 2400, true, now());
  
  -- 10-meter CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 2 AND variant_id = 'cct-10' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (2, 'cct-10', 60, 'CZK', 4800, true, now());
  
  -- 15-meter CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 2 AND variant_id = 'cct-15' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (2, 'cct-15', 60, 'CZK', 7200, true, now());
  
  -- 20-meter CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 2 AND variant_id = 'cct-20' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (2, 'cct-20', 60, 'CZK', 9600, true, now());
  
  -- 25-meter CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 2 AND variant_id = 'cct-25' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (2, 'cct-25', 60, 'CZK', 12000, true, now());
  
  -- 30-meter CCT warranty prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = 2 AND variant_id = 'cct-30' AND months = 60;
  
  INSERT INTO warranty_custom_prices (
    product_id, variant_id, months, currency, custom_price, is_active, updated_at
  ) VALUES (2, 'cct-30', 60, 'CZK', 14400, true, now());
END $$;

-- Update warranty_fixed_prices table for 60-month warranty
DO $$
BEGIN
  -- For RGB+CCT product
  IF EXISTS (
    SELECT 1 FROM warranty_fixed_prices 
    WHERE product_id = 1 AND months = 60 AND currency = 'CZK'
  ) THEN
    UPDATE warranty_fixed_prices
    SET price = 800
    WHERE product_id = 1 AND months = 60 AND currency = 'CZK';
  ELSE
    INSERT INTO warranty_fixed_prices (product_id, months, currency, price)
    VALUES (1, 60, 'CZK', 800);
  END IF;
  
  -- For CCT product
  IF EXISTS (
    SELECT 1 FROM warranty_fixed_prices 
    WHERE product_id = 2 AND months = 60 AND currency = 'CZK'
  ) THEN
    UPDATE warranty_fixed_prices
    SET price = 2400
    WHERE product_id = 2 AND months = 60 AND currency = 'CZK';
  ELSE
    INSERT INTO warranty_fixed_prices (product_id, months, currency, price)
    VALUES (2, 60, 'CZK', 2400);
  END IF;
END $$;

-- Ensure 24-month warranty policies also have entries in warranty_custom_prices
UPDATE warranty_custom_prices
SET is_active = false
WHERE months = 24;

-- Insert 24-month warranty prices for RGB+CCT product
DO $$
DECLARE
  variant_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
BEGIN
  FOREACH variant_id IN ARRAY variants
  LOOP
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

-- Insert 24-month warranty prices for CCT product
DO $$
DECLARE
  variant_id text;
  variants text[] := ARRAY['cct-5', 'cct-10', 'cct-15', 'cct-20', 'cct-25', 'cct-30'];
BEGIN
  FOREACH variant_id IN ARRAY variants
  LOOP
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