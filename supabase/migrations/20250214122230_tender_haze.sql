-- Update logo URL in site settings
UPDATE site_settings 
SET value = jsonb_build_object(
  'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-vfz30w9x1z1739534468925.png',
  'alt', 'LED Nabor'
)
WHERE key = 'logo';

-- Insert if not exists
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