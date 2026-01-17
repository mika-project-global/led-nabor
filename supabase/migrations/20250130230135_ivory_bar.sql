-- Update video bucket configuration
UPDATE storage.buckets
SET file_size_limit = 524288000, -- Увеличиваем до 500MB
    allowed_mime_types = ARRAY[
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv'
    ]
WHERE id = 'product-videos';

-- Enable RLS for storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Recreate policies with broader access
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read Access Videos" ON storage.objects;
    DROP POLICY IF EXISTS "Public Upload Access Videos" ON storage.objects;
    
    CREATE POLICY "Public Read Access Videos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'product-videos');

    CREATE POLICY "Public Upload Access Videos"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'product-videos');
END $$;