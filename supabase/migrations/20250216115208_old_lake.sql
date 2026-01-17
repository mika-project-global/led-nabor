-- Update logo URL in site settings
UPDATE site_settings 
SET value = jsonb_build_object(
  'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-1739706436326-evjwsa9uute.png',
  'alt', 'LED Nabor'
)
WHERE key = 'logo';

-- Ensure the logo setting exists
INSERT INTO site_settings (key, value)
SELECT 
  'logo',
  jsonb_build_object(
    'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-1739706436326-evjwsa9uute.png',
    'alt', 'LED Nabor'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM site_settings WHERE key = 'logo'
);