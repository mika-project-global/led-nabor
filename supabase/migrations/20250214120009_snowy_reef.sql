-- Update site-assets bucket configuration
UPDATE storage.buckets
SET file_size_limit = 524288, -- 512KB
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp']::text[]
WHERE id = 'site-assets';

-- Recreate policies with proper permissions
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public Read Access Site Assets" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Upload Access Site Assets" ON storage.objects;
    
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