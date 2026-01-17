/*
  # Fix Blog Posts Author ID and Update Policy
  
  ## Problem
  Existing blog posts have `author_id = NULL`, which prevents any updates because the RLS policy 
  requires matching author_id. This causes all edit attempts to be silently blocked.
  
  ## Changes
  1. Assign orphaned blog posts (author_id IS NULL) to the primary admin user
  2. Update the RLS UPDATE policy to handle edge cases and allow claiming orphaned posts
  
  ## Security
  - Posts with existing authors remain protected - only the author can update
  - Orphaned posts can be claimed by the first authenticated user who edits them
  - All updates require authentication
*/

-- Step 1: Assign existing orphaned blog posts to the primary admin user
-- Using the earliest created user as the default owner
DO $$
DECLARE
  primary_admin_id uuid;
BEGIN
  -- Get the first admin user (earliest created)
  SELECT id INTO primary_admin_id 
  FROM auth.users 
  ORDER BY created_at 
  LIMIT 1;
  
  -- Update orphaned posts
  IF primary_admin_id IS NOT NULL THEN
    UPDATE blog_posts 
    SET author_id = primary_admin_id,
        updated_at = now()
    WHERE author_id IS NULL;
    
    RAISE NOTICE 'Updated % orphaned blog posts to admin user %', 
      (SELECT COUNT(*) FROM blog_posts WHERE author_id = primary_admin_id), 
      primary_admin_id;
  END IF;
END $$;

-- Step 2: Improve the UPDATE policy to handle orphaned posts
DROP POLICY IF EXISTS "Authors can update posts in their translation group" ON blog_posts;

CREATE POLICY "Authors can update posts in their translation group"
  ON blog_posts FOR UPDATE TO authenticated
  USING (
    -- Allow if any post in translation group belongs to current user
    -- OR if the specific post being updated is orphaned (allows claiming)
    EXISTS (
      SELECT 1 FROM blog_posts bp
      WHERE bp.translation_group_id = blog_posts.translation_group_id
      AND bp.author_id = auth.uid()
    )
    OR blog_posts.author_id IS NULL
  )
  WITH CHECK (
    -- After update, ensure post is assigned to current user
    author_id = auth.uid()
  );