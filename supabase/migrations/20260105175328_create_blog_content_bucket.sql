/*
  # Create Blog Content Images Bucket
  
  1. New Storage Bucket
    - `blog-content` bucket for images used inside blog post content
  
  2. Storage Policies
    - Public read access for all users
    - Authenticated users can upload images
    - Authors can delete their own images
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'blog-content'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('blog-content', 'blog-content', true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Public read access for blog content images'
  ) THEN
    CREATE POLICY "Public read access for blog content images"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'blog-content');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Authenticated users can upload blog content images'
  ) THEN
    CREATE POLICY "Authenticated users can upload blog content images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'blog-content');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can update their own blog content images'
  ) THEN
    CREATE POLICY "Users can update their own blog content images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'blog-content' AND auth.uid() = owner)
      WITH CHECK (bucket_id = 'blog-content');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND policyname = 'Users can delete their own blog content images'
  ) THEN
    CREATE POLICY "Users can delete their own blog content images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'blog-content' AND auth.uid() = owner);
  END IF;
END $$;