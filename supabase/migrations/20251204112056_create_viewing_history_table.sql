/*
  # Create Viewing History Table

  1. New Tables
    - `viewing_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users, nullable for guest users)
      - `session_id` (text, for tracking guest sessions)
      - `product_id` (integer)
      - `viewed_at` (timestamp)

  2. Security
    - Enable RLS on `viewing_history` table
    - Add policy for authenticated users to view their own history
    - Add policy for guests to view their session history

  3. Indexes
    - Add index on user_id for faster queries
    - Add index on session_id for guest tracking
    - Add index on viewed_at for sorting
*/

CREATE TABLE IF NOT EXISTS viewing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id integer NOT NULL,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE viewing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history"
  ON viewing_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to own history"
  ON viewing_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guests can view session history"
  ON viewing_history
  FOR SELECT
  TO anon
  USING (user_id IS NULL);

CREATE POLICY "Guests can add to session history"
  ON viewing_history
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE INDEX IF NOT EXISTS viewing_history_user_id_idx 
  ON viewing_history(user_id);

CREATE INDEX IF NOT EXISTS viewing_history_session_id_idx 
  ON viewing_history(session_id);

CREATE INDEX IF NOT EXISTS viewing_history_viewed_at_idx 
  ON viewing_history(viewed_at DESC);

CREATE INDEX IF NOT EXISTS viewing_history_product_id_idx 
  ON viewing_history(product_id);
