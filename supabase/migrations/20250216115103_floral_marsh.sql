-- Drop existing policies
DROP POLICY IF EXISTS "Public access to site settings" ON site_settings;

-- Recreate policy with proper permissions
CREATE POLICY "Public access to site settings"
  ON site_settings
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Update or insert logo setting using upsert
INSERT INTO site_settings (key, value)
VALUES (
  'logo',
  jsonb_build_object(
    'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-1739706436326-evjwsa9uute.png',
    'alt', 'LED Nabor'
  )
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = now();