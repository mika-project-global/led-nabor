/*
  # Fix Blog Views Counter Function

  1. Issue
    - The increment_blog_views function has empty search_path
    - This prevents it from accessing the blog_posts table
    - Views counter doesn't increment when users read posts

  2. Solution
    - Recreate function with proper search_path = 'public'
    - Grant execute permissions to anon and authenticated users
    - Test that views increment correctly
*/

-- Drop and recreate the function with correct search_path
DROP FUNCTION IF EXISTS increment_blog_views(uuid) CASCADE;

CREATE OR REPLACE FUNCTION increment_blog_views(post_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = 'public'
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$;

-- Grant execute permissions to all users (including anonymous)
GRANT EXECUTE ON FUNCTION increment_blog_views(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_blog_views(uuid) TO authenticated;
