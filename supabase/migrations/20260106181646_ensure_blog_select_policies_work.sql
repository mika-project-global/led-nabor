/*
  # Ensure Blog Posts SELECT Policies Work Correctly

  1. Changes
    - Recreate SELECT policies to ensure they work with UPDATE...RETURNING
    - Make sure authenticated users can see all posts they have access to

  2. Reasoning
    - When using UPDATE with .select(), the returned rows must pass through SELECT policies
    - Need to ensure policies are properly ordered and don't conflict
*/

-- Drop all existing SELECT policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON blog_posts;

-- Recreate: Public can read published posts
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (published = true);

-- Recreate: Authenticated users can view all posts
CREATE POLICY "Authenticated users can view all blog posts"
  ON blog_posts
  FOR SELECT
  TO authenticated
  USING (true);
