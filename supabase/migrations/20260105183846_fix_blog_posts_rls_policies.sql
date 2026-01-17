/*
  # Fix Blog Posts RLS Policies for Translations

  1. Changes
    - Drop and recreate UPDATE policy to allow editing translations in the same group
    - Drop and recreate DELETE policy to allow deleting translations in the same group
    - Authors can now edit/delete all translations in their translation group

  2. Reasoning
    - When a user creates a post and then adds a translation, both posts should be editable
    - All posts in a translation_group_id should be manageable by the original author
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authors can update own blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can delete own blog posts" ON blog_posts;

-- Recreate UPDATE policy: allow if user is author of any post in the translation group
CREATE POLICY "Authors can update posts in their translation group"
  ON blog_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts bp
      WHERE bp.translation_group_id = blog_posts.translation_group_id
      AND bp.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM blog_posts bp
      WHERE bp.translation_group_id = blog_posts.translation_group_id
      AND bp.author_id = auth.uid()
    )
  );

-- Recreate DELETE policy: allow if user is author of any post in the translation group
CREATE POLICY "Authors can delete posts in their translation group"
  ON blog_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts bp
      WHERE bp.translation_group_id = blog_posts.translation_group_id
      AND bp.author_id = auth.uid()
    )
  );
