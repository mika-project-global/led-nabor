/*
  # Fix orders table permissions

  1. Changes
    - Drop existing policies if they exist
    - Create new policies for public access
    - Grant necessary permissions
    
  2. Security
    - Enable RLS
    - Allow public read/write access
*/

-- Ensure RLS is enabled for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies for orders table
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can read own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Public access to orders" ON orders;

-- Create single policy for all operations
CREATE POLICY "Public access to orders"
  ON orders
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON orders TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;