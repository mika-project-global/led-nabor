-- Create site-assets bucket if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES (
        'site-assets',
        'Site Assets',
        true
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Ensure proper policies for site-assets bucket
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public Read Access Site Assets" ON storage.objects;
    DROP POLICY IF EXISTS "Public Upload Access Site Assets" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Public Read Access Site Assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'site-assets');

    CREATE POLICY "Public Upload Access Site Assets"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'site-assets');
END $$;

-- Insert default site settings if they don't exist
INSERT INTO site_settings (key, value)
VALUES (
    'logo',
    jsonb_build_object(
        'url', 'https://led-nabor.com/storage/v1/object/public/site-assets/logo/site-logo-vfz30w9x1z1739534468925.png',
        'alt', 'LED Nabor'
    )
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value
WHERE site_settings.key = 'logo';