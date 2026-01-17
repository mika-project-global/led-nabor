/*
  # Insert Warranty Policies

  1. Changes
    - Insert warranty policies for all products
    - Add standard 24-month warranty as default
    - Add extended warranty options (36 and 48 months)
*/

-- Insert warranty policies for all products
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
ON CONFLICT DO NOTHING;