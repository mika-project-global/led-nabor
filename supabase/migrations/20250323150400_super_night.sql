/*
  # Add analytics functions and tables
  
  1. New Functions
    - get_database_size(): Returns database size in MB
    - get_storage_size(): Returns storage size in GB
    
  2. New Tables
    - analytics: Stores usage metrics
    
  3. Security
    - Enable RLS
    - Add public read access
*/

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_bandwidth bigint DEFAULT 0,
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

-- Insert initial analytics record if not exists
INSERT INTO analytics (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM analytics);

-- Function to get database size in MB
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
END;
$$;

-- Function to get storage size in GB
CREATE OR REPLACE FUNCTION get_storage_size()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  storage_size numeric;
BEGIN
  SELECT sum(octet_length(content)) / 1024.0 / 1024.0 / 1024.0
  INTO storage_size
  FROM storage.objects;
  RETURN COALESCE(round(storage_size::numeric, 2), 0);
END;
$$;