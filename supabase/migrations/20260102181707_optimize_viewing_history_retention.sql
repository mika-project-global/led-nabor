/*
  # Оптимизация срока хранения истории просмотров

  1. Проблема
    - Таблица viewing_history все еще занимает 465 MB
    - Даже после удаления записей, место не освобождается
    - Нужно уменьшить срок хранения

  2. Изменения
    - Изменяем срок хранения с 7 дней на 1 день
    - Удаляем старые записи (старше 1 дня)
    - Обновляем функцию очистки

  3. Безопасность
    - Сохраняем все существующие политики RLS
*/

-- Обновляем функцию для очистки записей старше 1 дня
DROP FUNCTION IF EXISTS cleanup_old_viewing_history();
DROP FUNCTION IF EXISTS cleanup_old_viewing_history_batch(integer);

CREATE OR REPLACE FUNCTION cleanup_old_viewing_history_batch(batch_size integer DEFAULT 10000)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM viewing_history 
    WHERE id IN (
      SELECT id FROM viewing_history
      WHERE viewed_at < (NOW() - INTERVAL '1 day')
      LIMIT batch_size
    )
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Запускаем очистку
SELECT cleanup_old_viewing_history() as deleted_count;
