/*
  # Update warranty fixed prices for all currencies
  
  1. Changes
    - Update fixed prices for 5-meter RGB+CCT product warranty
    - Set exact prices for each currency based on Stripe dashboard
    - Ensure consistent pricing across all interfaces
*/

-- Clear existing fixed prices for the product
DELETE FROM warranty_fixed_prices
WHERE product_id = 1 AND months = 60;

-- Insert updated fixed prices for 5-meter RGB+CCT product with 60-month warranty
INSERT INTO warranty_fixed_prices (product_id, months, currency, price)
VALUES
  (1, 60, 'CZK', 800.00),
  (1, 60, 'EUR', 32.00),
  (1, 60, 'GBP', 28.00),
  (1, 60, 'PLN', 140.00),
  (1, 60, 'UAH', 1450.00),
  (1, 60, 'USD', 35.00);

-- Update the fixed_price in warranty_policies table
UPDATE warranty_policies
SET 
  fixed_price = 800,
  stripe_price_id = 'price_1RBb0nKVsLiX4gAoxfXskhKv'
WHERE product_id = 1 AND months = 60;