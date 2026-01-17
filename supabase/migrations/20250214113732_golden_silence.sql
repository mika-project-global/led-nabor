-- Create bucket for site assets if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'site-assets',
        'Site Assets',
        true,
        524288, -- 512KB in bytes
        ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']::text[]
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Policies for storage.objects
DO $$
BEGIN
    -- Public read access for site assets
    CREATE POLICY "Public Read Access Site Assets"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'site-assets');

    -- Admin upload access for site assets
    CREATE POLICY "Admin Upload Access Site Assets"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'site-assets' AND
        auth.role() = 'authenticated'
    );
END $$;