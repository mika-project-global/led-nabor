/*
  # Fix site settings table

  1. Changes
    - Clear existing site settings
    - Insert default logo setting
    - Add unique constraint on key column
    - Add proper RLS policies
*/

-- Clear existing site settings
TRUNCATE TABLE site_settings;

-- Insert default logo setting
INSERT INTO site_settings (key, value)
VALUES (
  'logo',
  jsonb_build_object(
    'url', 'https://xgkvjlrjvfrsrtxovmkc.supabase.co/storage/v1/object/public/site-assets/logo/site-logo-1739706436326-evjwsa9uute.png',
    'alt', 'LED Nabor'
  )
);

-- Add unique constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'site_settings_key_unique'
  ) THEN
    ALTER TABLE site_settings 
    ADD CONSTRAINT site_settings_key_unique UNIQUE (key);
  END IF;
END $$;

-- Update RLS policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to site settings" ON site_settings;

CREATE POLICY "Public read access to site settings"
  ON site_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public update access to site settings"
  ON site_settings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);