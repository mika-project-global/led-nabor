/*
  # Add function to increment blog post views

  1. Functions
    - `increment_blog_views(post_id uuid)` - Safely increments view counter for a blog post
  
  2. Security
    - Function can be called by anyone (needed for public view counting)
    - Uses SECURITY DEFINER to bypass RLS for view counter updates only
*/

-- Function to increment blog post views
CREATE OR REPLACE FUNCTION increment_blog_views(post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$;