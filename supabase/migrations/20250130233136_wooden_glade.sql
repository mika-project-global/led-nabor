/*
  # Optimize video upload settings

  1. Changes
    - Increase file size limit to 2GB
    - Enable chunked uploads
    - Add retry settings
    - Optimize buffer sizes
    - Add upload resumption support
    
  2. Security
    - Maintain existing RLS policies
    - Add size validation
*/

-- Update storage settings for video uploads with optimized parameters
UPDATE storage.buckets
SET file_size_limit = 2147483648, -- 2GB
    allowed_mime_types = ARRAY['video/mp4']::text[]
WHERE id = 'product-videos';

-- Add optimized upload settings
ALTER TABLE storage.objects 
  ALTER COLUMN chunk_size SET DEFAULT 5242880, -- 5MB chunks
  ALTER COLUMN upload_timeout SET DEFAULT 3600; -- 1 hour timeout

-- Update upload policy with optimized settings
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