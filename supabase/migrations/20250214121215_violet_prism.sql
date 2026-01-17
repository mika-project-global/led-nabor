-- Update site-assets bucket configuration for better logo handling
UPDATE storage.buckets
SET file_size_limit = 1048576, -- 1MB to allow for high-quality logos
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']::text[]
WHERE id = 'site-assets';

-- Create a dedicated folder for logos if it doesn't exist
INSERT INTO storage.objects (bucket_id, name)
VALUES (
    'site-assets',
    'logo/'
) ON CONFLICT (bucket_id, name) DO NOTHING;

-- Recreate storage policies with proper access
DO $$
BEGIN
    -- Drop existing policies
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
    WITH CHECK (
        bucket_id = 'site-assets' AND
        CASE 
            WHEN SUBSTRING(name FROM 1 FOR 5) = 'logo/' THEN length(name) < 512
            ELSE true
        END
    );
END $$;