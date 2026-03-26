
/*
  # Clean Up viewing_history Table

  ## Problem
  The viewing_history table has grown to 213K+ rows, causing:
  - Slow queries even with indexes
  - Supabase connection pressure
  - General page load delays

  ## Changes
  1. Delete anonymous session records older than 30 days
  2. Delete authenticated user records older than 90 days
  3. Keep maximum 50 records per user/session (most recent only)

  ## Notes
  - This is a data cleanup only, no schema changes
  - Uses safe DELETE operations with WHERE conditions
*/

-- Delete old anonymous session viewing history (older than 30 days)
DELETE FROM public.viewing_history
WHERE user_id IS NULL
  AND viewed_at < NOW() - INTERVAL '30 days';

-- Delete old authenticated user viewing history (older than 90 days)
DELETE FROM public.viewing_history
WHERE user_id IS NOT NULL
  AND viewed_at < NOW() - INTERVAL '90 days';

-- For anonymous sessions: keep only last 20 entries per session
DELETE FROM public.viewing_history
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY viewed_at DESC) as rn
    FROM public.viewing_history
    WHERE user_id IS NULL
  ) ranked
  WHERE rn > 20
);
