/*
  # Пересоздание таблицы viewing_history для освобождения места

  1. Проблема
    - Таблица занимает 466 MB, хотя в ней всего 57 записей
    - PostgreSQL не освобождает место после DELETE автоматически
    - VACUUM FULL нельзя выполнить в транзакции

  2. Решение
    - Создаем новую таблицу с той же структурой
    - Копируем данные из старой таблицы
    - Удаляем старую и переименовываем новую
    - Восстанавливаем все индексы, триггеры и политики RLS

  3. Безопасность
    - Восстанавливаем все политики RLS
    - Сохраняем все существующие данные
*/

-- Создаем новую таблицу с той же структурой
CREATE TABLE viewing_history_new (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id integer NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

-- Копируем данные
INSERT INTO viewing_history_new (id, user_id, session_id, product_id, viewed_at)
SELECT id, user_id, session_id, product_id, viewed_at
FROM viewing_history;

-- Удаляем старую таблицу
DROP TABLE viewing_history CASCADE;

-- Переименовываем новую таблицу
ALTER TABLE viewing_history_new RENAME TO viewing_history;

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_viewing_history_user_id ON viewing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_session_id ON viewing_history(session_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_product_id ON viewing_history(product_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_viewed_at ON viewing_history(viewed_at);

-- Включаем RLS
ALTER TABLE viewing_history ENABLE ROW LEVEL SECURITY;

-- Восстанавливаем политики RLS
CREATE POLICY "Users can view own history"
ON viewing_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can view own history"
ON viewing_history
FOR SELECT
TO anon
USING (user_id IS NULL);

CREATE POLICY "Users can insert own history"
ON viewing_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anonymous users can insert history"
ON viewing_history
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Users can delete own history"
ON viewing_history
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can delete own history"
ON viewing_history
FOR DELETE
TO anon
USING (user_id IS NULL);

-- Восстанавливаем триггер для ограничения размера
CREATE OR REPLACE FUNCTION limit_viewing_history()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE TRIGGER limit_viewing_history_trigger
  AFTER INSERT ON viewing_history
  FOR EACH ROW
  EXECUTE FUNCTION limit_viewing_history();
