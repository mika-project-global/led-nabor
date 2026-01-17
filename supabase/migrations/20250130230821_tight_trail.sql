/*
  # Optimize video upload settings
  
  1. Changes
    - Update file size limit and MIME types for video bucket
    - Add chunked upload support
    - Optimize buffer settings
    - Update upload policies
*/

-- Update storage settings for video uploads
UPDATE storage.buckets
SET file_size_limit = 524288000, -- 500MB
    allowed_mime_types = ARRAY[
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv'
    ]::text[]
WHERE id = 'product-videos';

-- Add columns for chunked upload support if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND column_name = 'chunk_size'
    ) THEN
        ALTER TABLE storage.objects ADD COLUMN chunk_size bigint DEFAULT 5242880; -- 5MB chunks
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND column_name = 'multipart'
    ) THEN
        ALTER TABLE storage.objects ADD COLUMN multipart boolean DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND column_name = 'buffer_size'
    ) THEN
        ALTER TABLE storage.objects ADD COLUMN buffer_size bigint DEFAULT 16384; -- 16KB buffer
    END IF;
END $$;

-- Update upload policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Upload Access Videos" ON storage.objects;
    
    CREATE POLICY "Public Upload Access Videos"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (
      bucket_id = 'product-videos' AND
      length(name::text) < 512
    );
END $$;