-- Update warranty policies with simplified descriptions
TRUNCATE TABLE warranty_policies;

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
      'Стандартная гарантия',
      'Полная защита от заводских дефектов. Бесплатная замена или возврат денег при обнаружении неисправностей. Включает техническую поддержку и консультации по эксплуатации.',
      0::numeric,
      true
    ),
    (
      36,
      'Расширенная гарантия',
      'Увеличенный срок гарантии до 3 лет. Включает все преимущества базовой гарантии плюс приоритетную техническую поддержку и бесплатную диагностику при любых проблемах.',
      0.10,
      false
    ),
    (
      48,
      'Расширенная гарантия',
      'Максимальная защита на 4 года. Полное гарантийное обслуживание, VIP поддержка 24/7, бесплатная замена при любых неисправностях, включая случайные повреждения.',
      0.15,
      false
    )
) AS w (months, description, terms, price_multiplier, is_default);