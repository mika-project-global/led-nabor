/*
  # Add custom prices for products and warranties
  
  1. New Data
    - Add specific prices for RGB+CCT products in different lengths
    - Add specific prices for warranties in different currencies
    - Update existing prices to match Stripe configuration
    
  2. Features
    - Exact pricing for each product variant
    - Exact pricing for each warranty option
    - Support for all currencies
*/

-- Clear existing prices for RGB+CCT products (product_id = 1)
DELETE FROM product_prices
WHERE product_id = 1;

-- Add exact prices for RGB+CCT products in different lengths
INSERT INTO product_prices (product_id, variant_id, currency, custom_price, is_active)
VALUES
  -- 5-meter RGB+CCT prices
  (1, 'rgb-5', 'CZK', 5350, true),
  (1, 'rgb-5', 'EUR', 220, true),
  (1, 'rgb-5', 'UAH', 9500, true),
  (1, 'rgb-5', 'PLN', 950, true),
  (1, 'rgb-5', 'GBP', 190, true),
  (1, 'rgb-5', 'USD', 240, true),
  
  -- 10-meter RGB+CCT prices
  (1, 'rgb-10', 'CZK', 28000, true),
  (1, 'rgb-10', 'EUR', 1150, true),
  (1, 'rgb-10', 'UAH', 49000, true),
  (1, 'rgb-10', 'PLN', 4900, true),
  (1, 'rgb-10', 'GBP', 980, true),
  (1, 'rgb-10', 'USD', 1250, true),
  
  -- 15-meter RGB+CCT prices
  (1, 'rgb-15', 'CZK', 40000, true),
  (1, 'rgb-15', 'EUR', 1600, true),
  (1, 'rgb-15', 'UAH', 70000, true),
  (1, 'rgb-15', 'PLN', 7000, true),
  (1, 'rgb-15', 'GBP', 1400, true),
  (1, 'rgb-15', 'USD', 1800, true),
  
  -- 20-meter RGB+CCT prices
  (1, 'rgb-20', 'CZK', 52000, true),
  (1, 'rgb-20', 'EUR', 2100, true),
  (1, 'rgb-20', 'UAH', 91000, true),
  (1, 'rgb-20', 'PLN', 9100, true),
  (1, 'rgb-20', 'GBP', 1800, true),
  (1, 'rgb-20', 'USD', 2350, true),
  
  -- 25-meter RGB+CCT prices
  (1, 'rgb-25', 'CZK', 65000, true),
  (1, 'rgb-25', 'EUR', 2600, true),
  (1, 'rgb-25', 'UAH', 114000, true),
  (1, 'rgb-25', 'PLN', 11400, true),
  (1, 'rgb-25', 'GBP', 2250, true),
  (1, 'rgb-25', 'USD', 2900, true),
  
  -- 30-meter RGB+CCT prices
  (1, 'rgb-30', 'CZK', 78000, true),
  (1, 'rgb-30', 'EUR', 3100, true),
  (1, 'rgb-30', 'UAH', 136000, true),
  (1, 'rgb-30', 'PLN', 13600, true),
  (1, 'rgb-30', 'GBP', 2700, true),
  (1, 'rgb-30', 'USD', 3500, true);

-- Clear existing warranty prices for RGB+CCT products
DELETE FROM warranty_custom_prices
WHERE product_id = 1;

-- Add exact prices for 5-year warranty (60 months) for RGB+CCT products
INSERT INTO warranty_custom_prices (product_id, months, currency, custom_price, is_active)
VALUES
  -- 5-meter RGB+CCT warranty prices
  (1, 60, 'CZK', 800, true),
  (1, 60, 'EUR', 32, true),
  (1, 60, 'UAH', 1450, true),
  (1, 60, 'PLN', 140, true),
  (1, 60, 'GBP', 28, true),
  (1, 60, 'USD', 35, true),
  
  -- 10-meter RGB+CCT warranty prices
  (1, 60, 'CZK', 4200, true),
  (1, 60, 'EUR', 170, true),
  (1, 60, 'UAH', 7350, true),
  (1, 60, 'PLN', 735, true),
  (1, 60, 'GBP', 147, true),
  (1, 60, 'USD', 190, true),
  
  -- 15-meter RGB+CCT warranty prices
  (1, 60, 'CZK', 6000, true),
  (1, 60, 'EUR', 240, true),
  (1, 60, 'UAH', 10500, true),
  (1, 60, 'PLN', 1050, true),
  (1, 60, 'GBP', 210, true),
  (1, 60, 'USD', 270, true),
  
  -- 20-meter RGB+CCT warranty prices
  (1, 60, 'CZK', 7800, true),
  (1, 60, 'EUR', 315, true),
  (1, 60, 'UAH', 13650, true),
  (1, 60, 'PLN', 1365, true),
  (1, 60, 'GBP', 270, true),
  (1, 60, 'USD', 350, true),
  
  -- 25-meter RGB+CCT warranty prices
  (1, 60, 'CZK', 9750, true),
  (1, 60, 'EUR', 390, true),
  (1, 60, 'UAH', 17100, true),
  (1, 60, 'PLN', 1710, true),
  (1, 60, 'GBP', 340, true),
  (1, 60, 'USD', 435, true),
  
  -- 30-meter RGB+CCT warranty prices
  (1, 60, 'CZK', 11700, true),
  (1, 60, 'EUR', 465, true),
  (1, 60, 'UAH', 20400, true),
  (1, 60, 'PLN', 2040, true),
  (1, 60, 'GBP', 405, true),
  (1, 60, 'USD', 525, true);

-- Update Stripe price IDs for warranties
UPDATE warranty_policies
SET 
  stripe_price_id = 'price_1RBb0nKVsLiX4gAoxfXskhKv',
  fixed_price = 800
WHERE product_id = 1 AND months = 60;