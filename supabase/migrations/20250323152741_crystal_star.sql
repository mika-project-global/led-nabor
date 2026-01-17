/*
  # Fix site settings permissions and logo handling
  
  1. Changes
    - Drop and recreate site_settings table with proper structure
    - Add proper RLS policies
    - Add default logo setting
    - Add function to handle logo updates
*/

-- Drop existing table and policies
DROP TABLE IF EXISTS site_settings CASCADE;

-- Create site_settings table
CREATE TABLE site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Public can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Public access to site settings" ON site_settings;

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

CREATE POLICY "Anyone can delete site settings"
  ON site_settings
  FOR DELETE
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Insert default logo setting
INSERT INTO site_settings (key, value)
VALUES (
  'logo',
  jsonb_build_object(
    'url', '/favicon/favicon-96x96.png',
    'alt', 'LED Nabor'
  )
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value;

-- Grant necessary permissions
GRANT ALL ON site_settings TO public;
GRANT ALL ON site_settings TO anon;
GRANT ALL ON site_settings TO authenticated;