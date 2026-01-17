/*
  # Fix Security Issues Part 2 - Function Search Paths

  1. Drop existing functions with CASCADE
  2. Recreate with SET search_path for security
  3. Recreate all triggers
*/

-- Drop all existing functions with CASCADE
DROP FUNCTION IF EXISTS update_product_videos_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_installation_videos_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_blog_posts_updated_at() CASCADE;
DROP FUNCTION IF EXISTS increment_blog_views(uuid) CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_viewing_history_batch() CASCADE;
DROP FUNCTION IF EXISTS cleanup_old_viewing_history() CASCADE;
DROP FUNCTION IF EXISTS limit_viewing_history() CASCADE;

-- Recreate with secure search_path
CREATE FUNCTION update_product_videos_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE FUNCTION update_installation_videos_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE FUNCTION increment_blog_views(post_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE blog_posts
  SET views = views + 1
  WHERE id = post_id;
END;
$$;

CREATE FUNCTION cleanup_old_viewing_history_batch()
RETURNS void
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM viewing_history
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND id IN (
    SELECT id
    FROM viewing_history
    WHERE created_at < NOW() - INTERVAL '30 days'
    LIMIT 1000
  );
END;
$$;

CREATE FUNCTION cleanup_old_viewing_history()
RETURNS void
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM viewing_history
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

CREATE FUNCTION limit_viewing_history()
RETURNS trigger
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM viewing_history
  WHERE user_id = NEW.user_id
  AND id NOT IN (
    SELECT id
    FROM viewing_history
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    LIMIT 20
  );
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

CREATE TRIGGER product_videos_updated_at
  BEFORE UPDATE ON product_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_product_videos_updated_at();

CREATE TRIGGER installation_videos_updated_at
  BEFORE UPDATE ON installation_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_installation_videos_updated_at();
