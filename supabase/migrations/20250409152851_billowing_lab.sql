/*
  # Fix warranty display and pricing
  
  1. Changes
    - Add fixed_price column to warranty_policies table
    - Update existing policies with fixed prices where applicable
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add fixed_price column to warranty_policies table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'warranty_policies' AND column_name = 'fixed_price'
  ) THEN
    ALTER TABLE warranty_policies ADD COLUMN fixed_price numeric;
  END IF;
END $$;

-- Update fixed price for 5-meter RGB+CCT product warranty
UPDATE warranty_policies
SET fixed_price = 800
WHERE product_id = 1 AND months = 60 AND stripe_price_id = 'price_1RBb0nKVsLiX4gAoxfXskhKv';

-- Update warranty policy descriptions to be more clear about pricing
UPDATE warranty_policies
SET description = CASE
      WHEN months = 24 THEN 'Стандартная гарантия 24 месяца (включена в стоимость)'
      WHEN months = 60 THEN 'Премиум гарантия 5 лет (дополнительная защита)'
      ELSE description
    END
WHERE months IN (24, 60);