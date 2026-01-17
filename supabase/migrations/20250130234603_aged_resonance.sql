/*
  # Increase video file size limit

  1. Changes
    - Increase file size limit to 50MB for video uploads
    - Optimize chunk size for larger files
    - Increase upload timeout for larger files

  2. Security
    - Maintain existing security policies
    - Keep file type restrictions to MP4 only
*/

-- Update storage settings for video bucket
UPDATE storage.buckets
SET file_size_limit = 52428800 -- 50MB in bytes
WHERE id = 'product-videos';

-- Optimize upload settings for larger files
ALTER TABLE storage.objects 
  ALTER COLUMN chunk_size SET DEFAULT 2097152, -- 2MB chunks for better handling of larger files
  ALTER COLUMN upload_timeout SET DEFAULT 600; -- 10 minutes timeout