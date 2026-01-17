/*
  # Create Profile on User Signup Trigger

  ## Summary
  Automatically create a profile with 'user' role when a new user signs up

  ## Changes
  1. Create trigger function to handle new user signups
  2. Attach trigger to auth.users table
  
  ## Security
  - All new users get 'user' role by default
  - Only admins can promote users to 'admin' role
*/

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Ensure existing users have profiles with default 'user' role
INSERT INTO public.profiles (id, email, role)
SELECT 
  id,
  email,
  'user'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE profiles.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;
