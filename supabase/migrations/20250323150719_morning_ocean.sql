/*
  # Fix analytics table and functions
  
  1. Changes
    - Update analytics table structure
    - Add functions for analytics queries
    - Add proper error handling for existing policies
*/

-- Update analytics table to use proper column name
ALTER TABLE analytics RENAME COLUMN total_bandwidth TO total_storage_size;

-- Add function to get total build minutes
CREATE OR REPLACE FUNCTION get_total_build_minutes()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_minutes integer;
BEGIN
  SELECT total_build_minutes INTO total_minutes
  FROM analytics
  LIMIT 1;
  RETURN COALESCE(total_minutes, 0);
END;
$$;

-- Drop existing policy if it exists and recreate
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read analytics" ON analytics;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'analytics' 
        AND policyname = 'Public can read analytics'
    ) THEN
        CREATE POLICY "Public can read analytics"
          ON analytics
          FOR SELECT
          TO public
          USING (true);
    END IF;
END $$;