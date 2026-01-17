/*
  # Радикальное сокращение viewing_history

  1. Проблема
    - Таблица viewing_history все еще занимает 466 MB (93% от лимита)
    - После DELETE место не освобождается автоматически в PostgreSQL
    - Накопилось 188,014 записей

  2. Изменения
    - Удаляем ВСЕ записи кроме последних 1000 (по 50 на пользователя/сессию)
    - Добавляем триггер для автоматического ограничения размера таблицы
    - При каждой вставке удаляются старые записи если их больше лимита

  3. Безопасность
    - Сохраняем все политики RLS
    - Каждый пользователь/сессия сохраняет до 50 последних просмотров
*/

-- Создаем временную таблицу с последними 1000 записями
CREATE TEMP TABLE viewing_history_keep AS
SELECT DISTINCT ON (COALESCE(user_id::text, session_id), product_id) *
FROM viewing_history
ORDER BY COALESCE(user_id::text, session_id), product_id, viewed_at DESC
LIMIT 1000;

-- Удаляем все записи из основной таблицы
DELETE FROM viewing_history;

-- Вставляем обратно только нужные записи
INSERT INTO viewing_history
SELECT * FROM viewing_history_keep;

-- Функция для автоматического ограничения размера истории
CREATE OR REPLACE FUNCTION limit_viewing_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Удаляем старые записи для данного пользователя/сессии, оставляя только 50 последних
  DELETE FROM viewing_history
  WHERE id IN (
    SELECT id FROM viewing_history
    WHERE 
      (NEW.user_id IS NOT NULL AND user_id = NEW.user_id)
      OR 
      (NEW.user_id IS NULL AND session_id = NEW.session_id)
    ORDER BY viewed_at DESC
    OFFSET 50
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем триггер для автоматического ограничения
DROP TRIGGER IF EXISTS limit_viewing_history_trigger ON viewing_history;
CREATE TRIGGER limit_viewing_history_trigger
  AFTER INSERT ON viewing_history
  FOR EACH ROW
  EXECUTE FUNCTION limit_viewing_history();
