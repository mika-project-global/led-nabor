-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can read orders" ON orders;

-- Make user_id optional
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Create new policies
CREATE POLICY "Public can create orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read own orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);