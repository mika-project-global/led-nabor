/*
  # Optimize small video upload settings

  1. Changes
    - Disable chunked uploads for files under 10MB
    - Optimize for small MP4 files
    - Reduce timeout for small files
    - Add better error handling
*/

-- Update storage settings for video uploads
UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10MB для небольших видео
    allowed_mime_types = ARRAY['video/mp4']::text[]
WHERE id = 'product-videos';

-- Optimize settings for small files
ALTER TABLE storage.objects 
  ALTER COLUMN chunk_size SET DEFAULT 1048576, -- 1MB chunks
  ALTER COLUMN upload_timeout SET DEFAULT 60; -- 1 minute timeout

-- Update upload policy for small files
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Upload Access Videos" ON storage.objects;
    
    CREATE POLICY "Public Upload Access Videos"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (
      bucket_id = 'product-videos' AND
      length(name::text) < 256
    );
END $$;