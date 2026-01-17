/*
  # Fix warranty price consistency
  
  1. Changes
    - Add fixed_price column to warranty_policies table
    - Update fixed_price for 5-meter RGB+CCT product warranty to exactly 800
    - Ensure consistent pricing across all interfaces
*/

-- First add the fixed_price column if it doesn't exist
ALTER TABLE warranty_policies 
ADD COLUMN IF NOT EXISTS fixed_price numeric;

-- Update fixed price for 5-meter RGB+CCT product warranty to exactly 800
UPDATE warranty_policies
SET fixed_price = 800
WHERE product_id = 1 AND months = 60;

-- Make sure all warranty policies have consistent descriptions
UPDATE warranty_policies
SET description = CASE
      WHEN months = 24 THEN 'Стандартная гарантия 24 месяца (включена в стоимость)'
      WHEN months = 60 THEN 'Премиум гарантия 5 лет (дополнительная защита)'
      ELSE description
    END
WHERE months IN (24, 60);