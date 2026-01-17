-- First, remove any duplicate warranty policies
DELETE FROM warranty_policies a USING warranty_policies b
WHERE a.id > b.id 
  AND a.product_id = b.product_id 
  AND a.months = b.months;

-- Add unique constraint to prevent future duplicates
ALTER TABLE warranty_policies
ADD CONSTRAINT warranty_policies_product_months_unique 
UNIQUE (product_id, months);

-- Reinsert warranty policies with proper constraints
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
  w.months,
  w.description,
  w.terms,
  w.price_multiplier,
  w.is_default
FROM (
  SELECT generate_series(1, 24) AS product_id
) p
CROSS JOIN (
  VALUES
    (
      24,
      'Стандартная гарантия 24 месяца',
      'Гарантия распространяется на заводские дефекты и неисправности, возникшие по вине производителя. В случае обнаружения дефекта мы бесплатно заменим товар на новый или вернем деньги.',
      0::numeric,
      true
    ),
    (
      36,
      'Расширенная гарантия 36 месяцев (+12 месяцев)',
      'Включает стандартную гарантию плюс дополнительный год гарантийного обслуживания. Полное покрытие всех компонентов и расширенная техническая поддержка.',
      0.10,
      false
    ),
    (
      48,
      'Расширенная гарантия 48 месяцев (+24 месяца)',
      'Максимальная защита вашего оборудования на 4 года. Полное покрытие всех компонентов и расширенная техническая поддержка.',
      0.15,
      false
    )
) AS w (months, description, terms, price_multiplier, is_default)
ON CONFLICT (product_id, months) DO UPDATE
SET
  description = EXCLUDED.description,
  terms = EXCLUDED.terms,
  price_multiplier = EXCLUDED.price_multiplier,
  is_default = EXCLUDED.is_default,
  updated_at = now();