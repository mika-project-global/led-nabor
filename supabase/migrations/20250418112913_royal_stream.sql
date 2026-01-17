/*
  # Fix warranty pricing system
  
  1. Changes
    - Update warranty policies for both RGB+CCT and CCT products
    - Set correct fixed prices for different product lengths
    - Ensure proper display of warranty options in UI
    - Fix issue with returning to standard warranty
    
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
    FROM products
    WHERE id NOT IN (SELECT product_id FROM warranty_policies WHERE months = 60);
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
INSERT INTO warranty_custom_prices (
  product_id,
  variant_id,
  months,
  currency,
  custom_price,
  is_active,
  updated_at
) 
VALUES
  -- 5-meter RGB+CCT warranty prices
  (1, 'rgb-5', 60, 'CZK', 800, true, now()),
  
  -- 10-meter RGB+CCT warranty prices
  (1, 'rgb-10', 60, 'CZK', 1600, true, now()),
  
  -- 15-meter RGB+CCT warranty prices
  (1, 'rgb-15', 60, 'CZK', 2400, true, now()),
  
  -- 20-meter RGB+CCT warranty prices
  (1, 'rgb-20', 60, 'CZK', 3200, true, now()),
  
  -- 25-meter RGB+CCT warranty prices
  (1, 'rgb-25', 60, 'CZK', 4000, true, now()),
  
  -- 30-meter RGB+CCT warranty prices
  (1, 'rgb-30', 60, 'CZK', 4800, true, now());

-- Update variant-specific warranty prices for CCT product (product_id = 2)
INSERT INTO warranty_custom_prices (
  product_id,
  variant_id,
  months,
  currency,
  custom_price,
  is_active,
  updated_at
) 
VALUES
  -- 5-meter CCT warranty prices
  (2, 'cct-5', 60, 'CZK', 2400, true, now()),
  
  -- 10-meter CCT warranty prices
  (2, 'cct-10', 60, 'CZK', 4800, true, now()),
  
  -- 15-meter CCT warranty prices
  (2, 'cct-15', 60, 'CZK', 7200, true, now()),
  
  -- 20-meter CCT warranty prices
  (2, 'cct-20', 60, 'CZK', 9600, true, now()),
  
  -- 25-meter CCT warranty prices
  (2, 'cct-25', 60, 'CZK', 12000, true, now()),
  
  -- 30-meter CCT warranty prices
  (2, 'cct-30', 60, 'CZK', 14400, true, now());

-- Update warranty_fixed_prices table for 60-month warranty
INSERT INTO warranty_fixed_prices (
  product_id,
  months,
  currency,
  price
) 
VALUES
  (1, 60, 'CZK', 800),
  (2, 60, 'CZK', 2400)
ON CONFLICT (product_id, months, currency) 
DO UPDATE SET price = EXCLUDED.price;

-- Ensure 24-month warranty policies also have entries in warranty_custom_prices
UPDATE warranty_custom_prices
SET is_active = false
WHERE months = 24;

-- Insert 24-month warranty prices for RGB+CCT product
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
  1 AS product_id,
  variant_id,
  24 AS months,
  'CZK' AS currency,
  0 AS custom_price,
  true AS is_active,
  now() AS updated_at
FROM (
  VALUES
    ('rgb-5'),
    ('rgb-10'),
    ('rgb-15'),
    ('rgb-20'),
    ('rgb-25'),
    ('rgb-30')
) AS variants(variant_id);

-- Insert 24-month warranty prices for CCT product
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
  2 AS product_id,
  variant_id,
  24 AS months,
  'CZK' AS currency,
  0 AS custom_price,
  true AS is_active,
  now() AS updated_at
FROM (
  VALUES
    ('cct-5'),
    ('cct-10'),
    ('cct-15'),
    ('cct-20'),
    ('cct-25'),
    ('cct-30')
) AS variants(variant_id);