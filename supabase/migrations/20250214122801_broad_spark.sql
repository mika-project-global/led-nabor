-- Drop existing policies
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can update site settings" ON site_settings;

-- Create new policies with proper permissions
CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update site settings"
  ON site_settings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert site settings"
  ON site_settings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure default logo setting exists
INSERT INTO site_settings (key, value)
VALUES (
  'logo',
  jsonb_build_object(
    'url', null,
    'alt', 'LED Nabor'
  )
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value
WHERE site_settings.key = 'logo';