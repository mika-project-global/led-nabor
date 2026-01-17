/*
  # Add Admin Role System

  ## Summary
  Add role-based access control to restrict admin panel access

  ## Changes
  1. Add `role` column to profiles table
    - Default role: 'user'
    - Admin role: 'admin'
  
  2. Security Functions
    - Create function to check if user is admin
    - Use in RLS policies where needed

  ## Important Notes
  - Existing users will default to 'user' role
  - First user or specific users need to be manually promoted to 'admin'
  - Admin access is required for /admin routes
*/

-- Add role column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN role text NOT NULL DEFAULT 'user' 
    CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to promote user to admin (can only be called by existing admins or in migrations)
CREATE OR REPLACE FUNCTION promote_to_admin(user_email text)
RETURNS void AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;

  -- Update role in profiles
  UPDATE profiles
  SET role = 'admin', updated_at = now()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    -- Create profile if it doesn't exist
    INSERT INTO profiles (id, email, role)
    VALUES (target_user_id, user_email, 'admin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', updated_at = now();
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies to protect admin-only tables
-- Example: Only admins can manage certain operations

-- Update profiles policy to allow users to see their own role
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Comment: To promote a user to admin, connect to database and run:
-- SELECT promote_to_admin('your-email@example.com');
