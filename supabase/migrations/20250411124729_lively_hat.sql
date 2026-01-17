/*
  # Add warranty fixed prices table
  
  1. New Tables
    - `warranty_fixed_prices`
      - `product_id` (integer)
      - `months` (integer)
      - `currency` (text)
      - `price` (numeric)
      
  2. Security
    - Enable RLS
    - Add policy for public read access
*/

-- Create warranty fixed prices table
CREATE TABLE IF NOT EXISTS warranty_fixed_prices (
  product_id integer NOT NULL,
  months integer NOT NULL,
  currency text NOT NULL,
  price numeric NOT NULL,
  PRIMARY KEY (product_id, months, currency)
);

-- Enable RLS
ALTER TABLE warranty_fixed_prices ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'warranty_fixed_prices' 
    AND policyname = 'Public can read warranty fixed prices'
  ) THEN
    CREATE POLICY "Public can read warranty fixed prices"
      ON warranty_fixed_prices
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Insert fixed prices for 5-meter RGB+CCT product with 60-month warranty
INSERT INTO warranty_fixed_prices (product_id, months, currency, price)
VALUES
  (1, 60, 'CZK', 800.00),
  (1, 60, 'EUR', 32.00),
  (1, 60, 'GBP', 28.00),
  (1, 60, 'PLN', 140.00),
  (1, 60, 'UAH', 1450.00),
  (1, 60, 'USD', 35.00)
ON CONFLICT (product_id, months, currency) 
DO UPDATE SET price = EXCLUDED.price;