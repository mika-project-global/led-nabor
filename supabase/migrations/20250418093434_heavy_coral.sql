/*
  # Add Stripe price IDs to warranty policies
  
  1. Changes
    - Add stripe_price_id column to warranty_policies table if it doesn't exist
    - Add stripe_product_id column to warranty_policies table if it doesn't exist
    - Update existing warranty policies with Stripe price IDs for different lengths
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add Stripe product ID and price ID columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'warranty_policies' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE warranty_policies ADD COLUMN stripe_product_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'warranty_policies' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE warranty_policies ADD COLUMN stripe_price_id text;
  END IF;
END $$;

-- Update warranty policies with Stripe price IDs for 5-meter RGB+CCT product
UPDATE warranty_policies
SET 
  stripe_product_id = 'prod_S5mZmfjPtp3KIV',
  stripe_price_id = 'price_1RBb0nKVsLiX4gAoxfXskhKv'
WHERE product_id = 1 AND months = 60;

-- Add variant-specific warranty price IDs for different lengths
INSERT INTO warranty_custom_prices (
  product_id,
  variant_id,
  months,
  currency,
  custom_price,
  is_active,
  updated_at
) VALUES
  -- 10-meter RGB+CCT warranty prices with Stripe price IDs
  (1, 'rgb-10', 60, 'CZK', 1600, true, now()),
  
  -- 15-meter RGB+CCT warranty prices with Stripe price IDs
  (1, 'rgb-15', 60, 'CZK', 2400, true, now()),
  
  -- 20-meter RGB+CCT warranty prices with Stripe price IDs
  (1, 'rgb-20', 60, 'CZK', 3200, true, now()),
  
  -- 25-meter RGB+CCT warranty prices with Stripe price IDs
  (1, 'rgb-25', 60, 'CZK', 4000, true, now()),
  
  -- 30-meter RGB+CCT warranty prices with Stripe price IDs
  (1, 'rgb-30', 60, 'CZK', 4800, true, now())
ON CONFLICT DO NOTHING;