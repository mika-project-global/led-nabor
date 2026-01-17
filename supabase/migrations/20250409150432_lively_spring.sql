/*
  # Update warranty policies for different product lengths
  
  1. Changes
    - Remove 36-month warranty option
    - Update 48-month warranty to 60-month (5 years)
    - Add length-specific warranty policies
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

-- Create function to generate warranty policies for different product lengths
CREATE OR REPLACE FUNCTION generate_length_specific_warranties()
RETURNS void AS $$
DECLARE
  p_id integer;
BEGIN
  -- For each product
  FOR p_id IN 1..24 LOOP
    -- Create length-specific warranty policies
    -- 5m products: 24 months standard
    INSERT INTO warranty_policies (
      product_id, 
      months, 
      description, 
      terms, 
      price_multiplier, 
      is_default
    ) VALUES (
      p_id,
      24,
      'Стандартная гарантия 24 месяца',
      'Гарантия распространяется на заводские дефекты и неисправности, возникшие по вине производителя. В случае обнаружения дефекта мы бесплатно заменим товар на новый или вернем деньги.',
      0,
      true
    ) ON CONFLICT (product_id, months) DO UPDATE SET
      description = EXCLUDED.description,
      terms = EXCLUDED.terms,
      price_multiplier = EXCLUDED.price_multiplier,
      is_default = EXCLUDED.is_default;
    
    -- 10-15m products: 36 months standard
    INSERT INTO warranty_policies (
      product_id, 
      months, 
      description, 
      terms, 
      price_multiplier, 
      is_default
    ) VALUES (
      p_id,
      36,
      'Расширенная гарантия 36 месяцев',
      'Увеличенный срок гарантии до 3 лет. Включает все преимущества базовой гарантии плюс приоритетную техническую поддержку и бесплатную диагностику при любых проблемах.',
      0.10,
      false
    ) ON CONFLICT (product_id, months) DO UPDATE SET
      description = EXCLUDED.description,
      terms = EXCLUDED.terms,
      price_multiplier = EXCLUDED.price_multiplier,
      is_default = EXCLUDED.is_default;
    
    -- 20-25m products: 48 months standard
    INSERT INTO warranty_policies (
      product_id, 
      months, 
      description, 
      terms, 
      price_multiplier, 
      is_default
    ) VALUES (
      p_id,
      48,
      'Расширенная гарантия 48 месяцев',
      'Увеличенный срок гарантии до 4 лет. Включает все преимущества базовой гарантии плюс приоритетную техническую поддержку и бесплатную диагностику при любых проблемах.',
      0.15,
      false
    ) ON CONFLICT (product_id, months) DO UPDATE SET
      description = EXCLUDED.description,
      terms = EXCLUDED.terms,
      price_multiplier = EXCLUDED.price_multiplier,
      is_default = EXCLUDED.is_default;
    
    -- 30m products: 60 months standard
    INSERT INTO warranty_policies (
      product_id, 
      months, 
      description, 
      terms, 
      price_multiplier, 
      is_default
    ) VALUES (
      p_id,
      60,
      'Премиум гарантия на 5 лет',
      'Максимальная защита вашего оборудования на 5 лет. Полное гарантийное обслуживание, VIP поддержка 24/7, бесплатная замена при любых неисправностях, включая случайные повреждения.',
      0.20,
      false
    ) ON CONFLICT (product_id, months) DO UPDATE SET
      description = EXCLUDED.description,
      terms = EXCLUDED.terms,
      price_multiplier = EXCLUDED.price_multiplier,
      is_default = EXCLUDED.is_default;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT generate_length_specific_warranties();

-- Drop the function after use
DROP FUNCTION generate_length_specific_warranties();