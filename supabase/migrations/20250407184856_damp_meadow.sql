/*
  # Add warranty registrations table
  
  1. New Tables
    - `warranty_registrations`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key to orders)
      - `product_id` (integer)
      - `warranty_policy_id` (uuid, foreign key to warranty_policies)
      - `customer_email` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policy for public read access
    - Add policy for authenticated users to create registrations
*/

-- Create warranty registrations table
CREATE TABLE IF NOT EXISTS warranty_registrations (
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

-- Create policies
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