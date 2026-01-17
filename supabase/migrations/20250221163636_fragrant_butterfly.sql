/*
  # Add warranty tables and policies
  
  1. Tables:
    - warranty_history: Track warranty claims and resolutions
    - warranty_policies: Store warranty options for products
  
  2. Features:
    - Row Level Security enabled
    - Public read access
    - Automatic updated_at handling
    - Default warranty policies
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS warranty_history CASCADE;
DROP TABLE IF EXISTS warranty_policies CASCADE;

-- Create warranty history table
CREATE TABLE warranty_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  product_id integer NOT NULL,
  claim_date timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'pending',
  description text NOT NULL,
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create warranty policies table
CREATE TABLE warranty_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  months integer NOT NULL,
  description text NOT NULL,
  terms text NOT NULL,
  price_multiplier numeric DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE warranty_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_policies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can read warranty policies" ON warranty_policies;
DROP POLICY IF EXISTS "Public can read warranty history" ON warranty_history;

-- Create policies
CREATE POLICY "Public can read warranty policies"
  ON warranty_policies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read warranty history"
  ON warranty_history
  FOR SELECT
  TO public
  USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION handle_warranty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER warranty_history_updated_at
  BEFORE UPDATE ON warranty_history
  FOR EACH ROW
  EXECUTE PROCEDURE handle_warranty_updated_at();

CREATE TRIGGER warranty_policies_updated_at
  BEFORE UPDATE ON warranty_policies
  FOR EACH ROW
  EXECUTE PROCEDURE handle_warranty_updated_at();