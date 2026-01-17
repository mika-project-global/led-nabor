/*
  # Update warranty information for Stripe integration
  
  1. Changes
    - Update warranty policies for 5-meter RGB+CCT product
    - Set Stripe product ID and price ID for warranty
    - Update price multiplier based on actual pricing
    
  2. Security
    - Maintain existing RLS policies
*/

-- Update warranty policy for 5-meter RGB+CCT product (product_id = 1)
UPDATE warranty_policies
SET 
  price_multiplier = 0.15,  -- Based on 800 CZK for 5350 CZK product (~15%)
  description = 'Премиум гарантия на 5 лет',
  terms = 'Максимальная защита вашего оборудования на 5 лет. Полное гарантийное обслуживание, VIP поддержка 24/7, бесплатная замена при любых неисправностях, включая случайные повреждения.'
WHERE product_id = 1 AND months = 60;

-- Add Stripe product ID and price ID to warranty policies table if columns don't exist
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

-- Update Stripe product ID and price ID for 5-meter RGB+CCT product warranty
UPDATE warranty_policies
SET 
  stripe_product_id = 'prod_S5mZmfjPtp3KIV',
  stripe_price_id = 'price_1RBb0nKVsLiX4gAoxfXskhKv'
WHERE product_id = 1 AND months = 60;