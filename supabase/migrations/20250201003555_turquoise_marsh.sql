-- Create function to generate random dates between 2012 and now
CREATE OR REPLACE FUNCTION random_date_since_2012()
RETURNS timestamptz AS $$
BEGIN
  RETURN timestamp '2012-01-01 00:00:00' +
         (random() * (current_timestamp - timestamp '2012-01-01 00:00:00'));
END;
$$ LANGUAGE plpgsql;

-- Add 300 historical reviews
WITH review_data AS (
  SELECT
    -- Product ID selection
    CASE
      WHEN random() < 0.4 THEN
        -- 40% Luxury Bright Sets (products 20-23, 9-12)
        CASE (random() * 7)::int
          WHEN 0 THEN 20
          WHEN 1 THEN 21
          WHEN 2 THEN 22
          WHEN 3 THEN 23
          WHEN 4 THEN 9
          WHEN 5 THEN 10
          ELSE 11
        END
      WHEN random() < 0.7 THEN
        -- 30% Luxury Sets (products 17-19, 5-8)
        CASE (random() * 6)::int
          WHEN 0 THEN 17
          WHEN 1 THEN 18
          WHEN 2 THEN 19
          WHEN 3 THEN 5
          WHEN 4 THEN 6
          ELSE 7
        END
      ELSE
        -- 30% Standard Sets (products 13-16, 1-4)
        CASE (random() * 7)::int
          WHEN 0 THEN 13
          WHEN 1 THEN 14
          WHEN 2 THEN 15
          WHEN 3 THEN 16
          WHEN 4 THEN 1
          WHEN 5 THEN 2
          ELSE 3
        END
    END as product_id,
    -- Rating selection (60% 5-star, 35% 4-star, 5% 3-star)
    CASE
      WHEN random() < 0.6 THEN 5
      WHEN random() < 0.95 THEN 4
      ELSE 3
    END as rating_value,
    -- Random European name selection
    CASE (random() * 19)::int
      WHEN 0 THEN 'Thomas Weber'
      WHEN 1 THEN 'Marie Schmidt'
      WHEN 2 THEN 'Pierre Dubois'
      WHEN 3 THEN 'Sofia Andersson'
      WHEN 4 THEN 'Marco Rossi'
      WHEN 5 THEN 'Anna Kowalska'
      WHEN 6 THEN 'Hans Müller'
      WHEN 7 THEN 'Elena Popov'
      WHEN 8 THEN 'Jan Novák'
      WHEN 9 THEN 'Carmen Rodriguez'
      WHEN 10 THEN 'Lars Nielsen'
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
  FROM generate_series(1, 300)
)
INSERT INTO reviews (product_id, rating, comment, author_name, created_at)
SELECT 
  product_id,
  rating_value,
  CASE 
    WHEN rating_value = 5 THEN
      CASE (random() * 9)::int
        WHEN 0 THEN 'Превосходное качество света! Очень доволен покупкой.'
        WHEN 1 THEN 'Идеальное решение для нашего интерьера. Рекомендую!'
        WHEN 2 THEN 'Потрясающая яркость и равномерность освещения.'
        WHEN 3 THEN 'Качество сборки на высшем уровне. Всё работает идеально.'
        WHEN 4 THEN 'Шикарный свет! Преобразил всю комнату.'
        WHEN 5 THEN 'Великолепное качество исполнения. Стоит своих денег.'
        WHEN 6 THEN 'Отличный набор, всё продумано до мелочей.'
        WHEN 7 THEN 'Профессиональное качество, лучшее что видел.'
        ELSE 'Безупречное качество света. Очень доволен покупкой.'
      END
    WHEN rating_value = 4 THEN
      CASE (random() * 6)::int
        WHEN 0 THEN 'Хорошее качество, соответствует цене.'
        WHEN 1 THEN 'Достойный выбор, работает как надо.'
        WHEN 2 THEN 'Неплохой набор, всё функционирует отлично.'
        WHEN 3 THEN 'Качественная сборка, свет приятный.'
        WHEN 4 THEN 'Хороший выбор для домашнего освещения.'
        ELSE 'Вполне достойный продукт, рекомендую.'
      END
    ELSE
      CASE (random() * 3)::int
        WHEN 0 THEN 'Нормальное качество за свои деньги.'
        WHEN 1 THEN 'Работает, но есть небольшие недочеты.'
        ELSE 'Среднее качество, но свою функцию выполняет.'
      END
  END as comment,
  author_name,
  created_at
FROM review_data;