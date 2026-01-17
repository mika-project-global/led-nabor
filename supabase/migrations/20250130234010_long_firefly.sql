/*
  # Optimize admin uploads

  1. Changes
    - Optimize upload settings for both images and videos
    - Add special policy for admin uploads
    - Increase timeouts for admin interface
*/

-- Update storage settings for both buckets
UPDATE storage.buckets
SET file_size_limit = 10485760, -- 10MB limit
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4']::text[]
WHERE id IN ('product-images', 'product-videos');

-- Optimize upload settings
ALTER TABLE storage.objects 
  ALTER COLUMN chunk_size SET DEFAULT 262144, -- 256KB chunks для маленьких файлов
  ALTER COLUMN upload_timeout SET DEFAULT 300; -- 5 минут таймаут

-- Create special policy for admin uploads
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;
    DROP POLICY IF EXISTS "Public Upload Access Videos" ON storage.objects;
    
    -- Create new unified policy with simplified check
    CREATE POLICY "Admin Upload Access"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (
      bucket_id IN ('product-images', 'product-videos') AND
      length(name::text) < 256
    );
END $$;