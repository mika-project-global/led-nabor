/*
  # Optimize video upload settings for better reliability
  
  1. Changes
    - Reduce chunk size for more reliable uploads
    - Enable resumable uploads
    - Add upload timeouts
*/

-- Update storage settings for video uploads with optimized parameters
UPDATE storage.buckets
SET file_size_limit = 52428800, -- Уменьшаем до 50MB для надежности
    allowed_mime_types = ARRAY['video/mp4']::text[] -- Оставляем только MP4
WHERE id = 'product-videos';

-- Add columns for optimized upload support if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND column_name = 'chunk_size'
    ) THEN
        ALTER TABLE storage.objects ADD COLUMN chunk_size bigint DEFAULT 1048576; -- Уменьшаем до 1MB chunks
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND column_name = 'resumable'
    ) THEN
        ALTER TABLE storage.objects ADD COLUMN resumable boolean DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND column_name = 'upload_timeout'
    ) THEN
        ALTER TABLE storage.objects ADD COLUMN upload_timeout integer DEFAULT 300; -- 5 минут таймаут
    END IF;
END $$;

-- Update upload policies with optimized settings
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Upload Access Videos" ON storage.objects;
    
    CREATE POLICY "Public Upload Access Videos"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (
      bucket_id = 'product-videos' AND
      length(name::text) < 512 AND
      octet_length(decode(replace(split_part(name, '.', 1), '-', ''), 'hex')) < 16
    );
END $$;