-- Update logo URL in site settings with proper error handling
DO $$
BEGIN
    -- Update existing logo setting
    UPDATE site_settings 
    SET value = jsonb_build_object(
        'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-1739706436326-evjwsa9uute.png',
        'alt', 'LED Nabor'
    ),
    updated_at = now()
    WHERE key = 'logo';

    -- Insert if not exists
    IF NOT FOUND THEN
        INSERT INTO site_settings (key, value)
        VALUES (
            'logo',
            jsonb_build_object(
                'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-1739706436326-evjwsa9uute.png',
                'alt', 'LED Nabor'
            )
        );
    END IF;
END $$;