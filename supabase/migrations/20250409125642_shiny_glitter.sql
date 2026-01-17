/*
  # Update warranty policies
  
  1. Changes
    - Remove 36-month warranty option
    - Change 48-month warranty to 60-month (5 years)
    - Update descriptions and terms
    
  2. Security
    - Maintain existing RLS policies
*/

-- Delete 36-month warranty policies
DELETE FROM warranty_policies
WHERE months = 36;

-- Update 48-month warranty policies to 60-month
UPDATE warranty_policies
SET 
  months = 60,
  description = 'Премиум гарантия на 5 лет',
  terms = 'Максимальная защита вашего оборудования на 5 лет. Полное гарантийное обслуживание, VIP поддержка 24/7, бесплатная замена при любых неисправностях, включая случайные повреждения.',
  price_multiplier = 0.20
WHERE months = 48;