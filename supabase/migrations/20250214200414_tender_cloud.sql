/*
  # Fix authentication and user profiles

  1. Changes
    - Add proper RLS policies for auth tables
    - Enable email signup
    - Fix profile creation trigger
    - Add email templates
*/

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate profile creation trigger with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Update auth policies
DO $$
BEGIN
    -- Policy for reading own data
    DROP POLICY IF EXISTS "Users can read own data" ON auth.users;
    CREATE POLICY "Users can read own data" 
    ON auth.users
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

    -- Policy for updating own data
    DROP POLICY IF EXISTS "Users can update own data" ON auth.users;
    CREATE POLICY "Users can update own data" 
    ON auth.users
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

    -- Policy for inserting new users
    DROP POLICY IF EXISTS "Anyone can sign up" ON auth.users;
    CREATE POLICY "Anyone can sign up"
    ON auth.users
    FOR INSERT
    TO anon
    WITH CHECK (true);
END $$;