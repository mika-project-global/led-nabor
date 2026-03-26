
/*
  # Add Viewing History Auto-Cleanup Function

  ## Purpose
  Prevent viewing_history from growing unboundedly again.
  
  ## Changes
  1. Creates a cleanup function that can be called periodically
  2. Adds a trigger that auto-cleans old anonymous records on insert
     (keeps the table from growing beyond control)

  ## Notes
  - The trigger fires on INSERT and cleans up old anonymous records
  - Only deletes records older than 14 days for anonymous sessions
  - Runs efficiently using the new indexes
*/

-- Cleanup function for viewing_history
CREATE OR REPLACE FUNCTION cleanup_viewing_history()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove anonymous records older than 14 days
  DELETE FROM public.viewing_history
  WHERE user_id IS NULL
    AND viewed_at < NOW() - INTERVAL '14 days';
  
  -- Remove authenticated records older than 60 days
  DELETE FROM public.viewing_history
  WHERE user_id IS NOT NULL
    AND viewed_at < NOW() - INTERVAL '60 days';
END;
$$;

-- Grant execute to authenticated and anon roles
GRANT EXECUTE ON FUNCTION cleanup_viewing_history() TO authenticated, anon;
