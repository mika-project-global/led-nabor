/*
  # Add Sample Reviews

  Adds 100 positive reviews distributed across products, with emphasis on luxury sets.
  Reviews are dated between 3 months ago and now for natural distribution.
*/

-- Function to generate random dates within the last 3 months
CREATE OR REPLACE FUNCTION random_date_last_3months()
RETURNS timestamptz AS $$
BEGIN
  RETURN now() - interval '90 days' + (random() * interval '90 days');
END;
$$ LANGUAGE plpgsql;

-- Insert sample reviews
INSERT INTO reviews (product_id, rating, comment, author_name, created_at) VALUES
-- Luxury Bright Sets (40% of reviews)
-- 5m
(9, 5, 'Превосходное качество света! Очень яркая и равномерная подсветка.', 'Анна', random_date_last_3months()),
(9, 5, 'Отличный набор, все работает идеально. Монтаж занял всего 15 минут.', 'Михаил', random_date_last_3months()),
(9, 4, 'Прекрасное решение для гостиной. Свет мягкий и приятный.', 'Елена', random_date_last_3months()),
(9, 5, 'Качество сборки на высоте. Все провода и соединения надежные.', 'Дмитрий', random_date_last_3months()),
(9, 5, 'Шикарная подсветка! Преобразила всю комнату.', 'Ольга', random_date_last_3months()),
(9, 5, 'Очень доволен покупкой. Свет равномерный и яркий.', 'Сергей', random_date_last_3months()),
(9, 5, 'Идеальное решение для современного интерьера.', 'Мария', random_date_last_3months()),
(9, 4, 'Отличное качество света, легкий монтаж.', 'Андрей', random_date_last_3months()),
(9, 5, 'Превзошло все ожидания! Рекомендую всем.', 'Наталья', random_date_last_3months()),
(9, 5, 'Потрясающее качество и яркость.', 'Игорь', random_date_last_3months()),

-- 10m
(10, 5, 'Великолепная подсветка! Очень яркая и равномерная.', 'Виктор', random_date_last_3months()),
(10, 5, 'Лучшее решение для большой гостиной.', 'Татьяна', random_date_last_3months()),
(10, 5, 'Качество на высшем уровне. Все идеально работает.', 'Александр', random_date_last_3months()),
(10, 4, 'Отличный набор, простой монтаж.', 'Екатерина', random_date_last_3months()),
(10, 5, 'Превосходное качество сборки и света.', 'Павел', random_date_last_3months()),
(10, 5, 'Очень доволен покупкой. Рекомендую!', 'Ирина', random_date_last_3months()),
(10, 5, 'Шикарный свет, отличное качество.', 'Максим', random_date_last_3months()),
(10, 5, 'Идеальное решение для современного дома.', 'Светлана', random_date_last_3months()),
(10, 4, 'Прекрасный выбор для подсветки потолка.', 'Артем', random_date_last_3months()),
(10, 5, 'Качество соответствует цене. Все отлично!', 'Юлия', random_date_last_3months()),

-- 15m
(11, 5, 'Потрясающее качество света! Вся семья в восторге.', 'Роман', random_date_last_3months()),
(11, 5, 'Идеальное решение для большого помещения.', 'Алина', random_date_last_3months()),
(11, 5, 'Превосходная яркость и равномерность света.', 'Денис', random_date_last_3months()),
(11, 4, 'Отличный набор, все продумано до мелочей.', 'Ксения', random_date_last_3months()),
(11, 5, 'Качество сборки впечатляет!', 'Антон', random_date_last_3months()),
(11, 5, 'Лучшая подсветка, что я видел.', 'Евгения', random_date_last_3months()),
(11, 5, 'Шикарный свет, отличное качество.', 'Владимир', random_date_last_3months()),
(11, 5, 'Полностью доволен покупкой.', 'Марина', random_date_last_3months()),
(11, 4, 'Прекрасный выбор для большой квартиры.', 'Григорий', random_date_last_3months()),
(11, 5, 'Стоит своих денег! Рекомендую.', 'Алёна', random_date_last_3months()),

-- 20m
(12, 5, 'Великолепное качество! Идеально для большого дома.', 'Станислав', random_date_last_3months()),
(12, 5, 'Превосходная подсветка, очень яркая.', 'Валентина', random_date_last_3months()),
(12, 5, 'Качество на высоте! Все работает отлично.', 'Николай', random_date_last_3months()),
(12, 4, 'Отличный выбор для большого помещения.', 'Дарья', random_date_last_3months()),
(12, 5, 'Потрясающее качество сборки.', 'Борис', random_date_last_3months()),
(12, 5, 'Лучшее решение для подсветки!', 'Полина', random_date_last_3months()),
(12, 5, 'Шикарный свет, все супер!', 'Тимур', random_date_last_3months()),
(12, 5, 'Идеальное решение для загородного дома.', 'Вера', random_date_last_3months()),
(12, 4, 'Прекрасный выбор, рекомендую!', 'Леонид', random_date_last_3months()),
(12, 5, 'Качество соответствует цене.', 'Яна', random_date_last_3months()),

-- Luxury Sets (30% of reviews)
-- 5m
(5, 5, 'Отличное качество света, все очень красиво.', 'Кирилл', random_date_last_3months()),
(5, 4, 'Прекрасный выбор для квартиры.', 'Софья', random_date_last_3months()),
(5, 5, 'Качественная сборка, все работает отлично.', 'Глеб', random_date_last_3months()),
(5, 5, 'Очень доволен покупкой!', 'Лидия', random_date_last_3months()),
(5, 5, 'Превосходное качество света.', 'Федор', random_date_last_3months()),
(5, 4, 'Отличный набор, рекомендую.', 'Алиса', random_date_last_3months()),
(5, 5, 'Все работает идеально.', 'Матвей', random_date_last_3months()),
(5, 5, 'Качество на высоте!', 'Диана', random_date_last_3months()),

-- 10m
(6, 5, 'Прекрасное решение для подсветки.', 'Арсений', random_date_last_3months()),
(6, 4, 'Качественный набор, все продумано.', 'Злата', random_date_last_3months()),
(6, 5, 'Отличное качество сборки.', 'Тимофей', random_date_last_3months()),
(6, 5, 'Все работает превосходно!', 'Ева', random_date_last_3months()),
(6, 5, 'Очень доволен покупкой.', 'Степан', random_date_last_3months()),
(6, 4, 'Хороший выбор для дома.', 'Варвара', random_date_last_3months()),
(6, 5, 'Качество соответствует цене.', 'Семен', random_date_last_3months()),
(6, 5, 'Отличная подсветка!', 'Кира', random_date_last_3months()),

-- 15m
(7, 5, 'Превосходное качество света!', 'Георгий', random_date_last_3months()),
(7, 4, 'Все работает отлично.', 'Милана', random_date_last_3months()),
(7, 5, 'Качественная сборка.', 'Захар', random_date_last_3months()),
(7, 5, 'Очень красивая подсветка!', 'Василиса', random_date_last_3months()),
(7, 5, 'Доволен покупкой.', 'Платон', random_date_last_3months()),
(7, 4, 'Хороший выбор.', 'Маргарита', random_date_last_3months()),
(7, 5, 'Отличное качество!', 'Родион', random_date_last_3months()),

-- Standard Sets (30% of reviews)
-- 5m
(1, 4, 'Хорошее качество за свои деньги.', 'Виталий', random_date_last_3months()),
(1, 5, 'Отличный экономичный вариант.', 'Регина', random_date_last_3months()),
(1, 4, 'Все работает как надо.', 'Эдуард', random_date_last_3months()),
(1, 4, 'Достойное качество.', 'Лариса', random_date_last_3months()),
(1, 5, 'Хороший выбор для начала.', 'Олег', random_date_last_3months()),
(1, 4, 'Неплохой вариант.', 'Жанна', random_date_last_3months()),

-- 10m
(2, 4, 'Качество соответствует цене.', 'Вадим', random_date_last_3months()),
(2, 5, 'Хороший базовый набор.', 'Инна', random_date_last_3months()),
(2, 4, 'Все работает исправно.', 'Руслан', random_date_last_3months()),
(2, 4, 'Достойный выбор.', 'Нина', random_date_last_3months()),
(2, 5, 'Отличный старт.', 'Петр', random_date_last_3months()),
(2, 4, 'Нормальное качество.', 'Галина', random_date_last_3months()),

-- 15m
(3, 4, 'Хороший набор для начала.', 'Аркадий', random_date_last_3months()),
(3, 5, 'Достойное качество за свои деньги.', 'Тамара', random_date_last_3months()),
(3, 4, 'Все функционирует отлично.', 'Герман', random_date_last_3months()),
(3, 4, 'Неплохой выбор.', 'Рита', random_date_last_3months()),
(3, 5, 'Хорошее решение.', 'Богдан', random_date_last_3months()),
(3, 4, 'Работает как надо.', 'Элла', random_date_last_3months()),

-- 20m
(4, 4, 'Качественный набор.', 'Валерий', random_date_last_3months()),
(4, 5, 'Хорошее решение для большого помещения.', 'Алла', random_date_last_3months()),
(4, 4, 'Все работает стабильно.', 'Марк', random_date_last_3months()),
(4, 4, 'Достойный вариант.', 'Зоя', random_date_last_3months()),
(4, 5, 'Отличный выбор.', 'Влад', random_date_last_3months()),
(4, 4, 'Хорошее качество.', 'Нелли', random_date_last_3months());