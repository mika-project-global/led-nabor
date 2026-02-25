/*
  # Allow Order Status Updates for Guest Orders

  ## Changes
  - Allow updating guest orders (where user_id IS NULL)
  - This is needed for updating order status during payment flow
  
  ## Security
  - Guest orders can be updated (for status changes)
  - Authenticated users can still update only their own orders
*/

-- Allow guest orders to be updated (for status changes during payment)
CREATE POLICY "Guest orders can be updated"
  ON orders FOR UPDATE TO anon
  USING (user_id IS NULL)
  WITH CHECK (user_id IS NULL);