-- Create bucket for product videos if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'product-videos',
        'Product Videos',
        true,
        104857600, -- 100MB in bytes
        ARRAY['video/mp4']::text[]
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Policies for storage.objects for video bucket
DO $$
BEGIN
    -- Public read access for videos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Read Access Videos' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Read Access Videos"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'product-videos');
    END IF;

    -- Public upload access for videos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Upload Access Videos' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Upload Access Videos"
        ON storage.objects FOR INSERT
        TO public
        WITH CHECK (bucket_id = 'product-videos');
    END IF;

    -- Public update access for videos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Update Access Videos' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Update Access Videos"
        ON storage.objects FOR UPDATE
        TO public
        USING (bucket_id = 'product-videos');
    END IF;

    -- Public delete access for videos
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Delete Access Videos' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Delete Access Videos"
        ON storage.objects FOR DELETE
        TO public
        USING (bucket_id = 'product-videos');
    END IF;
END $$;