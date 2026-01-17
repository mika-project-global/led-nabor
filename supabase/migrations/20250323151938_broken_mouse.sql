/*
  # Fix analytics table and functions
  
  1. Changes
    - Drop existing analytics table
    - Create new analytics table with proper structure
    - Add RLS policies
    - Create helper functions
*/

-- Drop existing analytics table and recreate
DROP TABLE IF EXISTS analytics CASCADE;

CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_storage_size bigint DEFAULT 0,
  total_build_minutes integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can read analytics"
  ON analytics
  FOR SELECT
  TO public
  USING (true);

-- Insert initial analytics record
INSERT INTO analytics (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM analytics);

-- Create or replace database size function
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  db_size numeric;
BEGIN
  SELECT pg_database_size(current_database()) / 1024.0 / 1024.0
  INTO db_size;
  RETURN round(db_size::numeric, 2);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$;

-- Create or replace storage size function
CREATE OR REPLACE FUNCTION get_storage_size()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  storage_size numeric;
BEGIN
  SELECT COALESCE(sum(length(decode(metadata->>'size', 'escape')::text)), 0) / 1024.0 / 1024.0 / 1024.0
  INTO storage_size
  FROM storage.objects;
  RETURN round(storage_size::numeric, 2);
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$;