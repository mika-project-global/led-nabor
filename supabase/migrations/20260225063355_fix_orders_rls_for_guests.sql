/*
  # Fix Orders RLS for Guest Users

  ## Changes
  - Allow guest (anonymous) users to create orders
  - Allow guest users to insert orders with user_id = NULL
  - Authenticated users can still create orders with their user_id
  
  ## Security
  - Guest users can only create orders (INSERT)
  - Guest users cannot view orders (SELECT requires authentication)
  - Authenticated users can view/update only their own orders
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create own orders" ON orders;

-- Allow authenticated users to create orders with their user_id
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Allow anonymous (guest) users to create orders with user_id = NULL
CREATE POLICY "Guest users can create orders"
  ON orders FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);