/*
  # Add price management system
  
  1. New Tables
    - `product_prices` - Хранит пользовательские цены для продуктов
    - `warranty_custom_prices` - Хранит пользовательские цены для гарантий
    
  2. Security
    - Enable RLS
    - Add policies for public access
*/

-- Create product_prices table
CREATE TABLE IF NOT EXISTS product_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  variant_id text NOT NULL,
  currency text NOT NULL DEFAULT 'CZK',
  custom_price numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create warranty_custom_prices table
CREATE TABLE IF NOT EXISTS warranty_custom_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  months integer NOT NULL,
  currency text NOT NULL DEFAULT 'CZK',
  custom_price numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_custom_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for product_prices
CREATE POLICY "Public can read product prices"
  ON product_prices
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert product prices"
  ON product_prices
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update product prices"
  ON product_prices
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for warranty_custom_prices
CREATE POLICY "Public can read warranty custom prices"
  ON warranty_custom_prices
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert warranty custom prices"
  ON warranty_custom_prices
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update warranty custom prices"
  ON warranty_custom_prices
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for faster lookups
CREATE INDEX product_prices_product_variant_idx ON product_prices (product_id, variant_id);
CREATE INDEX warranty_custom_prices_product_months_idx ON warranty_custom_prices (product_id, months);

-- Create trigger for updated_at
CREATE TRIGGER product_prices_updated_at
  BEFORE UPDATE ON product_prices
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

CREATE TRIGGER warranty_custom_prices_updated_at
  BEFORE UPDATE ON warranty_custom_prices
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();

-- Create functions to get custom prices
CREATE OR REPLACE FUNCTION get_product_custom_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
BEGIN
  SELECT price INTO custom_price
  FROM product_prices
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND currency = p_currency
    AND is_active = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  RETURN custom_price;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_warranty_custom_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
BEGIN
  SELECT custom_price INTO custom_price
  FROM warranty_custom_prices
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  RETURN custom_price;
END;
$$ LANGUAGE plpgsql;