-- Add reviews for 20m Luxury RGB product (product_id = 8)
WITH review_data AS (
  SELECT
    8 as product_id, -- 20m Luxury RGB product
    CASE
      WHEN random() < 0.6 THEN 5
      WHEN random() < 0.95 THEN 4
      ELSE 3
    END as rating_value,
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
    random_date_since_2012() as created_at
  FROM generate_series(1, 30) -- Adding 30 reviews
)
INSERT INTO reviews (product_id, rating, comment, author_name, created_at)
SELECT 
  product_id,
  rating_value,
  CASE 
    WHEN rating_value = 5 THEN
      CASE (random() * 9)::int
        WHEN 0 THEN 'Идеальное решение для большого помещения! Очень яркая и равномерная подсветка.'
        WHEN 1 THEN 'Превосходное качество света. Отлично подходит для просторных комнат.'
        WHEN 2 THEN 'Потрясающие цветовые эффекты. Управление очень удобное.'
        WHEN 3 THEN 'Качество сборки на высшем уровне. Прекрасно работает по всей длине.'
        WHEN 4 THEN 'Шикарная подсветка! Преобразила весь интерьер.'
        WHEN 5 THEN 'Великолепное качество исполнения. Цвета насыщенные и яркие.'
        WHEN 6 THEN 'Отличный набор для большого помещения. Всё продумано до мелочей.'
        WHEN 7 THEN 'Профессиональное качество, лучшее решение для просторных помещений.'
        ELSE 'Безупречное качество света. Идеально подходит для больших пространств.'
      END
    WHEN rating_value = 4 THEN
      CASE (random() * 6)::int
        WHEN 0 THEN 'Хорошее качество, отлично подходит для больших помещений.'
        WHEN 1 THEN 'Достойный выбор для просторных комнат.'
        WHEN 2 THEN 'Качественный набор, все функционирует отлично.'
        WHEN 3 THEN 'Надежная сборка, приятный свет по всей длине.'
        WHEN 4 THEN 'Хороший выбор для большого пространства.'
        ELSE 'Качественный продукт, рекомендую для больших помещений.'
      END
    ELSE
      CASE (random() * 3)::int
        WHEN 0 THEN 'Нормальное качество для большой площади.'
        WHEN 1 THEN 'Работает хорошо, но есть небольшие нюансы при монтаже.'
        ELSE 'Среднее качество, но для большого помещения подходит.'
      END
  END as comment,
  author_name,
  created_at
FROM review_data;