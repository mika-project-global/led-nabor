/*
  # Fix warranty periods
  
  1. Changes
    - Remove all warranty policies except 24 and 60 months
    - Set 24 months as default warranty
    - Set 60 months (5 years) as premium warranty
    
  2. Security
    - Maintain existing RLS policies
*/

-- Delete all warranty policies except 24 months default ones
DELETE FROM warranty_policies
WHERE months != 24 OR NOT is_default;

-- Insert 60-month warranty policies for all products
INSERT INTO warranty_policies (
  product_id, 
  months, 
  description, 
  terms, 
  price_multiplier, 
  is_default
)
SELECT
  p.product_id,
  60,
  'Премиум гарантия на 5 лет',
  'Максимальная защита вашего оборудования на 5 лет. Полное гарантийное обслуживание, VIP поддержка 24/7, бесплатная замена при любых неисправностях, включая случайные повреждения.',
  0.20,
  false
FROM (
  SELECT generate_series(1, 24) AS product_id
) p
ON CONFLICT (product_id, months) DO UPDATE SET
  description = EXCLUDED.description,
  terms = EXCLUDED.terms,
  price_multiplier = EXCLUDED.price_multiplier,
  is_default = EXCLUDED.is_default;

-- Update 24-month warranty descriptions to be consistent
UPDATE warranty_policies
SET 
  description = 'Стандартная гарантия 24 месяца',
  terms = 'Гарантия распространяется на заводские дефекты и неисправности, возникшие по вине производителя. В случае обнаружения дефекта мы бесплатно заменим товар на новый или вернем деньги.',
  price_multiplier = 0,
  is_default = true
WHERE months = 24;