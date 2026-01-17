/*
  # Установка точных цен для продуктов и гарантий
  
  1. Изменения
    - Добавление точных цен для продуктов в разных валютах
    - Добавление точных цен для гарантий в разных валютах
*/

-- Очистка старых цен для продукта с ID 1 (5-метровый RGB+CCT набор)
DELETE FROM product_prices
WHERE product_id = 1 AND variant_id = 'rgb-5';

-- Добавление точных цен для продукта с ID 1 в разных валютах
INSERT INTO product_prices (product_id, variant_id, currency, custom_price, is_active)
VALUES
  (1, 'rgb-5', 'CZK', 5350, true),
  (1, 'rgb-5', 'EUR', 220, true),
  (1, 'rgb-5', 'UAH', 9500, true),
  (1, 'rgb-5', 'PLN', 950, true),
  (1, 'rgb-5', 'GBP', 190, true),
  (1, 'rgb-5', 'USD', 240, true);

-- Очистка старых цен для гарантии продукта с ID 1
DELETE FROM warranty_custom_prices
WHERE product_id = 1 AND months = 60;

-- Добавление точных цен для 5-летней гарантии в разных валютах
INSERT INTO warranty_custom_prices (product_id, months, currency, custom_price, is_active)
VALUES
  (1, 60, 'CZK', 800, true),
  (1, 60, 'EUR', 32, true),
  (1, 60, 'UAH', 1450, true),
  (1, 60, 'PLN', 140, true),
  (1, 60, 'GBP', 28, true),
  (1, 60, 'USD', 35, true);

-- Обновление цен для 10-метрового RGB+CCT набора
DELETE FROM product_prices
WHERE product_id = 1 AND variant_id = 'rgb-10';

INSERT INTO product_prices (product_id, variant_id, currency, custom_price, is_active)
VALUES
  (1, 'rgb-10', 'CZK', 28000, true),
  (1, 'rgb-10', 'EUR', 1150, true),
  (1, 'rgb-10', 'UAH', 49000, true),
  (1, 'rgb-10', 'PLN', 4900, true),
  (1, 'rgb-10', 'GBP', 980, true),
  (1, 'rgb-10', 'USD', 1250, true);