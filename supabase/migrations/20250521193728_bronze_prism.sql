/*
  # Add Stripe product ID column and update White CCT prices
  
  1. Changes
    - Add stripeProductId column to products table
    - Update White CCT product prices and Stripe price IDs
    - Ensure proper synchronization between tables
    
  2. Security
    - Maintain existing RLS policies
*/

-- First, add the stripeProductId column to the products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_product_id text;
  END IF;
END $$;

-- Update the White CCT product with Stripe product ID
UPDATE products
SET stripe_product_id = 'prod_SLys9BCrhGl9Yz'
WHERE id = 2;

-- Update the variants in the products table directly
UPDATE products
SET variants = jsonb_build_array(
  jsonb_build_object(
    'id', 'cct-5',
    'length', 5,
    'price', 4350,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RRGuJKVsLiX4gAouApc9AHB'
  ),
  jsonb_build_object(
    'id', 'cct-10',
    'length', 10,
    'price', 7850,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RRGuJKVsLiX4gAoIQTrRMtc'
  ),
  jsonb_build_object(
    'id', 'cct-15',
    'length', 15,
    'price', 11500,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RRGuJKVsLiX4gAoYc5sUPdJ'
  ),
  jsonb_build_object(
    'id', 'cct-20',
    'length', 20,
    'price', 15100,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RRGuJKVsLiX4gAoVTFh8aJ7'
  ),
  jsonb_build_object(
    'id', 'cct-25',
    'length', 25,
    'price', 18700,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RRGuJKVsLiX4gAoxFj37LDX'
  ),
  jsonb_build_object(
    'id', 'cct-30',
    'length', 30,
    'price', 22300,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RRGuJKVsLiX4gAox64j3r32'
  )
)
WHERE id = 2;

-- Update the product_prices table to match
-- First, deactivate all existing prices for White CCT product
UPDATE product_prices
SET is_active = false
WHERE product_id = 2
  AND currency = 'CZK'
  AND is_active = true;

-- Insert new prices for each variant
INSERT INTO product_prices (product_id, variant_id, currency, custom_price, is_active, updated_at)
VALUES
  (2, 'cct-5', 'CZK', 4350, true, now()),
  (2, 'cct-10', 'CZK', 7850, true, now()),
  (2, 'cct-15', 'CZK', 11500, true, now()),
  (2, 'cct-20', 'CZK', 15100, true, now()),
  (2, 'cct-25', 'CZK', 18700, true, now()),
  (2, 'cct-30', 'CZK', 22300, true, now());

-- Force a timestamp update to ensure the changes are picked up
UPDATE products
SET updated_at = now()
WHERE id = 2;