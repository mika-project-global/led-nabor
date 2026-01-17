-- Add reviews for remaining products with appropriate distribution
WITH review_data AS (
  SELECT
    CASE (random() * 19)::int
      WHEN 0 THEN 'Friedrich Weber'
      WHEN 1 THEN 'Charlotte Dubois'
      WHEN 2 THEN 'Henrik Nielsen'
      WHEN 3 THEN 'Isabella Rossi'
      WHEN 4 THEN 'Maximilian Schulz'
      WHEN 5 THEN 'Sophie Laurent'
      WHEN 6 THEN 'Gustav Bergström'
      WHEN 7 THEN 'Elena Romano'
      WHEN 8 THEN 'Jan Kowalski'
      WHEN 9 THEN 'Marie Dupont'
      WHEN 10 THEN 'Lars Andersen'
      WHEN 11 THEN 'Giulia Ferrari'
      WHEN 12 THEN 'Viktor Nagy'
      WHEN 13 THEN 'Sophie Martin'
      WHEN 14 THEN 'Klaus Schmidt'
      WHEN 15 THEN 'Maria García'
      WHEN 16 THEN 'Anders Johansen'
      WHEN 17 THEN 'Eva Svobodová'
      WHEN 18 THEN 'Giovanni Russo'
      ELSE 'Lukas Novák'
    END as author_name,
    CASE
      WHEN random() < 0.6 THEN 5
      WHEN random() < 0.95 THEN 4
      ELSE 3
    END as rating_value,
    random_date_since_2012() as created_at
  FROM generate_series(1, 30)
)
INSERT INTO reviews (product_id, rating, comment, author_name, created_at)
SELECT 
  15, -- Product ID for 15m Standard
  rating_value,
  CASE 
    WHEN rating_value = 5 THEN
      CASE (random() * 9)::int
        WHEN 0 THEN 'Отличное решение для большого помещения! Качество соответствует цене.'
        WHEN 1 THEN 'Хороший базовый набор для просторных комнат.'
        WHEN 2 THEN 'Приятные цветовые эффекты, удобное управление.'
        WHEN 3 THEN 'Качественная сборка, работает стабильно по всей длине.'
        WHEN 4 THEN 'Хорошая подсветка для большого пространства.'
        WHEN 5 THEN 'Достойное качество исполнения. Цвета яркие.'
        WHEN 6 THEN 'Хороший набор для большого помещения.'
        WHEN 7 THEN 'Надежное решение для просторных помещений.'
        ELSE 'Качественный свет для больших пространств.'
      END
    WHEN rating_value = 4 THEN
      CASE (random() * 6)::int
        WHEN 0 THEN 'Неплохое качество для больших помещений.'
        WHEN 1 THEN 'Подходящий выбор для просторных комнат.'
        WHEN 2 THEN 'Работает стабильно, функционал хороший.'
        WHEN 3 THEN 'Нормальная сборка, свет равномерный.'
        WHEN 4 THEN 'Подходит для большого пространства.'
        ELSE 'Рабочий вариант для больших помещений.'
      END
    ELSE
      CASE (random() * 3)::int
        WHEN 0 THEN 'Базовое качество для большой площади.'
        WHEN 1 THEN 'Работает, есть мелкие недочеты при монтаже.'
        ELSE 'Среднее качество, но длины хватает.'
      END
  END as comment,
  author_name,
  created_at
FROM review_data;