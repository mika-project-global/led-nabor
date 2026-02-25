/*
  # Fix Payment Sessions RLS for Guest Users

  ## Changes
  - Allow guest (anonymous) users to create payment sessions
  - Allow guest users to insert payment sessions with user_id = NULL
  - Authenticated users can still create payment sessions with their user_id
  
  ## Security
  - Guest users can only create payment sessions (INSERT)
  - Guest users cannot view payment sessions (SELECT requires authentication)
  - Authenticated users can view only their own payment sessions
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create own payment sessions" ON payment_sessions;

-- Allow authenticated users to create payment sessions with their user_id
CREATE POLICY "Authenticated users can create payment sessions"
  ON payment_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Allow anonymous (guest) users to create payment sessions with user_id = NULL
CREATE POLICY "Guest users can create payment sessions"
  ON payment_sessions FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);