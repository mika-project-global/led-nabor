/*
  # Update product catalog structure
  
  1. New Tables
    - `product_variants` for storing length variants
    - `product_specifications` for detailed specs
    
  2. Changes
    - Add new columns to products table
    - Update categories
    
  3. Security
    - Enable RLS
    - Add policies for public read access
*/

-- Create product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  length integer NOT NULL, -- in meters
  price numeric NOT NULL,
  stock_status text NOT NULL DEFAULT 'in_stock',
  created_at timestamptz DEFAULT now()
);

-- Create product specifications table
CREATE TABLE IF NOT EXISTS product_specifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  name text NOT NULL,
  value text NOT NULL,
  unit text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read product variants"
  ON product_variants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read product specifications"
  ON product_specifications
  FOR SELECT
  TO public
  USING (true);