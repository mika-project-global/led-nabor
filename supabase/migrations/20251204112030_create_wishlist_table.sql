/*
  # Create Wishlist Table

  1. New Tables
    - `wishlist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `product_id` (integer, references products)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `wishlist` table
    - Add policy for authenticated users to manage their own wishlist items

  3. Indexes
    - Add index on user_id for faster queries
    - Add unique constraint on (user_id, product_id) to prevent duplicates
*/

CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wishlist"
  ON wishlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own wishlist"
  ON wishlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from own wishlist"
  ON wishlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS wishlist_user_product_unique 
  ON wishlist(user_id, product_id);

CREATE INDEX IF NOT EXISTS wishlist_user_id_idx 
  ON wishlist(user_id);
