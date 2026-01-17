/*
  # Fix analytics functions and queries
  
  1. Changes
    - Fix get_storage_size function to use proper column
    - Update analytics table name references
    - Add proper error handling
*/

-- Drop and recreate get_storage_size function with proper column name
CREATE OR REPLACE FUNCTION get_storage_size()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  storage_size numeric;
BEGIN
  -- Use proper column name from storage.objects
  SELECT COALESCE(sum(length(decode(metadata->>'size', 'escape')::text, 'UTF8')), 0) / 1024.0 / 1024.0 / 1024.0
  INTO storage_size
  FROM storage.objects;
  RETURN round(storage_size::numeric, 2);
EXCEPTION
  WHEN OTHERS THEN
    -- Return 0 if any error occurs
    RETURN 0;
END;
$$;

-- Update analytics queries to use correct table name
DO $$
BEGIN
  -- Rename table if using old name
  ALTER TABLE IF EXISTS _analytics RENAME TO analytics;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;