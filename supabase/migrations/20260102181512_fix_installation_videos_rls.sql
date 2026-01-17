/*
  # Исправление политик RLS для installation_videos

  1. Проблема
    - Authenticated пользователи не могут видеть все видео (только активные)
    - Это мешает удалению видео в админ панели

  2. Изменения
    - Добавляем отдельную политику SELECT для authenticated пользователей
    - Authenticated пользователи могут видеть ВСЕ видео (включая неактивные)
    - Публичные пользователи видят только активные видео

  3. Безопасность
    - Сохраняем все существующие политики
    - Authenticated пользователи получают полный доступ для администрирования
*/

-- Добавляем политику SELECT для authenticated пользователей
CREATE POLICY "Authenticated users can view all installation videos"
ON installation_videos
FOR SELECT
TO authenticated
USING (true);
