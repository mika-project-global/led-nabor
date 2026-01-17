/*
  # Update storage settings for video uploads

  1. Changes
    - Set file size limit to 50MB
    - Configure optimal chunk sizes
    - Update upload timeout
    - Allow only MP4 videos

  2. Security
    - Keep public access enabled
    - Maintain file type restrictions
*/

-- Update storage settings for video bucket
UPDATE storage.buckets
SET file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY['video/mp4']::text[],
    public = true
WHERE id = 'product-videos';

-- Configure optimal upload settings
ALTER TABLE storage.objects 
  ALTER COLUMN chunk_size SET DEFAULT 5242880, -- 5MB chunks for optimal upload
  ALTER COLUMN upload_timeout SET DEFAULT 3600; -- 1 hour timeout for reliability

-- Update storage policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public Upload Access Videos" ON storage.objects;
    
    -- Create new upload policy with optimized settings
    CREATE POLICY "Public Upload Access Videos"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (
      bucket_id = 'product-videos' AND
      length(name::text) < 512
    );
END $$;