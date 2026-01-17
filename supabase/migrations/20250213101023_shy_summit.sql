-- Enable RLS on auth tables
ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user management
DO $$
BEGIN
    -- Policy for reading own data
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can read own data'
        AND tablename = 'users'
        AND schemaname = 'auth'
    ) THEN
        CREATE POLICY "Users can read own data" 
        ON auth.users
        FOR SELECT 
        TO authenticated
        USING (auth.uid() = id);
    END IF;

    -- Policy for updating own data
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Users can update own data'
        AND tablename = 'users'
        AND schemaname = 'auth'
    ) THEN
        CREATE POLICY "Users can update own data" 
        ON auth.users
        FOR UPDATE 
        TO authenticated
        USING (auth.uid() = id);
    END IF;
END $$;