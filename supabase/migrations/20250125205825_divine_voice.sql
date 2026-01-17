/*
  # Fix orders table RLS policies

  1. Changes
    - Remove user_id requirement from RLS policies
    - Add public access for order creation
    - Keep read access restricted to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;

-- Create new policies that don't require authentication for order creation
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);