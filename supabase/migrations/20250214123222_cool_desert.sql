-- Update site settings policies
DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can insert site settings" ON site_settings;

-- Create new simplified policies
CREATE POLICY "Public access to site settings"
  ON site_settings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update logo setting with proper JSON structure
UPDATE site_settings 
SET value = jsonb_build_object(
  'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-vfz30w9x1z1739534468925.png',
  'alt', 'LED Nabor'
)
WHERE key = 'logo';

-- Ensure logo setting exists
INSERT INTO site_settings (key, value)
SELECT 
  'logo',
  jsonb_build_object(
    'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-vfz30w9x1z1739534468925.png',
    'alt', 'LED Nabor'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM site_settings WHERE key = 'logo'
);