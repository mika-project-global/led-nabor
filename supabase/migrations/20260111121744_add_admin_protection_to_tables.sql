/*
  # Защита административных таблиц с проверкой is_admin()

  ## Краткое описание
  Добавляет проверку роли администратора для всех операций управления критичными данными

  ## Изменения
  
  ### 1. Таблица installation_videos
  - Только администраторы могут создавать, обновлять и удалять видео установки
  - Публичный доступ только на чтение активных видео
  
  ### 2. Таблица product_videos
  - Только администраторы могут управлять видео продуктов
  - Публичный доступ на чтение всех видео
  
  ### 3. Таблица product_prices
  - Только администраторы могут изменять цены продуктов
  - Публичный доступ на чтение цен
  
  ### 4. Таблица warranty_custom_prices
  - Только администраторы могут изменять цены гарантий
  - Публичный доступ на чтение цен
  
  ### 5. Таблица site_settings
  - Только администраторы могут изменять настройки сайта
  - Публичный доступ на чтение настроек

  ## Безопасность
  - Использование функции is_admin() для проверки прав
  - Разделение политик для чтения (публичные) и записи (только админы)
  - Защита от несанкционированного изменения критичных данных
*/

-- =====================================================
-- 1. INSTALLATION_VIDEOS - Защита видео установки
-- =====================================================

DROP POLICY IF EXISTS "Public can view active installation videos" ON installation_videos;
DROP POLICY IF EXISTS "Authenticated can view all installation videos" ON installation_videos;
DROP POLICY IF EXISTS "Authenticated users can manage installation videos" ON installation_videos;

-- Публичный доступ на чтение только активных видео
CREATE POLICY "Public can view active installation videos"
  ON installation_videos FOR SELECT TO anon
  USING (is_active = true);

-- Аутентифицированные видят все видео
CREATE POLICY "Authenticated can view all installation videos"
  ON installation_videos FOR SELECT TO authenticated
  USING (true);

-- Только администраторы могут управлять видео
CREATE POLICY "Admins can insert installation videos"
  ON installation_videos FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update installation videos"
  ON installation_videos FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete installation videos"
  ON installation_videos FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- 2. PRODUCT_VIDEOS - Защита видео продуктов
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view product videos" ON product_videos;
DROP POLICY IF EXISTS "Authenticated users can manage product videos" ON product_videos;

-- Все могут просматривать видео продуктов
CREATE POLICY "Anyone can view product videos"
  ON product_videos FOR SELECT
  USING (true);

-- Только администраторы могут управлять видео продуктов
CREATE POLICY "Admins can insert product videos"
  ON product_videos FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product videos"
  ON product_videos FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete product videos"
  ON product_videos FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- 3. PRODUCT_PRICES - Защита цен продуктов
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view product prices" ON product_prices;
DROP POLICY IF EXISTS "Authenticated users can manage product prices" ON product_prices;

-- Все могут просматривать цены
CREATE POLICY "Anyone can view product prices"
  ON product_prices FOR SELECT
  USING (true);

-- Только администраторы могут управлять ценами
CREATE POLICY "Admins can insert product prices"
  ON product_prices FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product prices"
  ON product_prices FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete product prices"
  ON product_prices FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- 4. WARRANTY_CUSTOM_PRICES - Защита цен гарантий
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view warranty custom prices" ON warranty_custom_prices;
DROP POLICY IF EXISTS "Authenticated users can manage warranty custom prices" ON warranty_custom_prices;

-- Все могут просматривать цены гарантий
CREATE POLICY "Anyone can view warranty custom prices"
  ON warranty_custom_prices FOR SELECT
  USING (true);

-- Только администраторы могут управлять ценами гарантий
CREATE POLICY "Admins can insert warranty custom prices"
  ON warranty_custom_prices FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update warranty custom prices"
  ON warranty_custom_prices FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete warranty custom prices"
  ON warranty_custom_prices FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- 5. SITE_SETTINGS - Защита настроек сайта
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can manage site settings" ON site_settings;

-- Все могут просматривать настройки сайта
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Только администраторы могут управлять настройками
CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete site settings"
  ON site_settings FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- КОММЕНТАРИИ ДЛЯ АДМИНИСТРАТОРОВ
-- =====================================================

-- Для продвижения пользователя в администраторы используйте:
-- SELECT promote_to_admin('email@example.com');

-- Для проверки, является ли текущий пользователь администратором:
-- SELECT is_admin();
