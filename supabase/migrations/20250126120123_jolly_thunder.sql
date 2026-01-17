/*
  # Setup storage for product images
  
  1. Create bucket for product images with public access
  2. Setup security policies for the bucket
*/

-- Create bucket for product images if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'product-images',
        'Product Images',
        true,
        5242880, -- 5MB in bytes
        ARRAY['image/jpeg', 'image/png', 'image/gif']::text[]
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Policies for storage.objects
DO $$
BEGIN
    -- Public read access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Read Access' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Read Access"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'product-images');
    END IF;

    -- Public upload access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Upload Access' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Upload Access"
        ON storage.objects FOR INSERT
        TO public
        WITH CHECK (bucket_id = 'product-images');
    END IF;

    -- Public update access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Update Access' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Update Access"
        ON storage.objects FOR UPDATE
        TO public
        USING (bucket_id = 'product-images');
    END IF;

    -- Public delete access
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Delete Access' 
        AND tablename = 'objects' 
        AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Delete Access"
        ON storage.objects FOR DELETE
        TO public
        USING (bucket_id = 'product-images');
    END IF;
END $$;