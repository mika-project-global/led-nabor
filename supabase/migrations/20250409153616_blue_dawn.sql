/*
  # Fix warranty registrations table
  
  1. Changes
    - Drop existing table if it exists
    - Create warranty_registrations table with proper constraints
    - Add proper RLS policies
    - Add indexes for performance
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS warranty_registrations CASCADE;

-- Create warranty registrations table
CREATE TABLE warranty_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id integer NOT NULL,
  warranty_policy_id uuid REFERENCES warranty_policies(id),
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE warranty_registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read warranty registrations" ON warranty_registrations;
DROP POLICY IF EXISTS "Authenticated users can create warranty registrations" ON warranty_registrations;

-- Create new policies
CREATE POLICY "Public can read warranty registrations"
  ON warranty_registrations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create warranty registrations"
  ON warranty_registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER warranty_registrations_updated_at
  BEFORE UPDATE ON warranty_registrations
  FOR EACH ROW
  EXECUTE PROCEDURE handle_warranty_updated_at();

-- Create index for faster lookups
CREATE INDEX warranty_registrations_order_id_idx ON warranty_registrations (order_id);
CREATE INDEX warranty_registrations_customer_email_idx ON warranty_registrations (customer_email);