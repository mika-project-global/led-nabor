/*
  # Очистка viewing_history и оптимизация хранилища

  1. Проблема
    - Таблица viewing_history занимает 420 MB (из 500 MB лимита)
    - В таблице более 2 миллионов записей
    - Это критично для дискового пространства

  2. Изменения
    - Создаем индекс для быстрой очистки по дате
    - Создаем функцию для постепенной очистки старых записей
    - Автоматическая очистка будет выполняться порциями

  3. Безопасность
    - Сохраняем все существующие политики RLS
    - Добавляем функцию для регулярной очистки
*/

-- Создаем индекс для быстрой очистки по дате (если еще не существует)
CREATE INDEX IF NOT EXISTS idx_viewing_history_viewed_at 
ON viewing_history(viewed_at);

-- Удаляем старую функцию если существует
DROP FUNCTION IF EXISTS cleanup_old_viewing_history();

-- Функция для постепенной очистки старых записей (по 10000 записей за раз)
CREATE OR REPLACE FUNCTION cleanup_old_viewing_history_batch(batch_size integer DEFAULT 10000)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM viewing_history 
    WHERE id IN (
      SELECT id FROM viewing_history
      WHERE viewed_at < (NOW() - INTERVAL '7 days')
      LIMIT batch_size
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для полной очистки (вызывает batch функцию несколько раз)
CREATE OR REPLACE FUNCTION cleanup_old_viewing_history()
RETURNS integer AS $$
DECLARE
  total_deleted integer := 0;
  batch_deleted integer;
  max_iterations integer := 100;
  iteration integer := 0;
BEGIN
  LOOP
    SELECT cleanup_old_viewing_history_batch(10000) INTO batch_deleted;
    total_deleted := total_deleted + batch_deleted;
    iteration := iteration + 1;
    
    EXIT WHEN batch_deleted = 0 OR iteration >= max_iterations;
  END LOOP;
  
  RETURN total_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
