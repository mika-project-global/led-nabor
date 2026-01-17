/*
  # Fix warranty pricing for different currencies
  
  1. Changes
    - Update fixed price for 5-meter RGB+CCT product warranty
    - Add exact prices for each currency
    - Ensure consistent pricing across all interfaces
*/

-- Update fixed price for 5-meter RGB+CCT product warranty to exactly 800 CZK
UPDATE warranty_policies
SET fixed_price = 800
WHERE product_id = 1 AND months = 60;

-- Create a constant table for exact warranty prices
CREATE TABLE IF NOT EXISTS warranty_fixed_prices (
  product_id integer NOT NULL,
  months integer NOT NULL,
  currency text NOT NULL,
  price numeric NOT NULL,
  PRIMARY KEY (product_id, months, currency)
);

-- Insert exact prices for 5-meter RGB+CCT product with 60-month warranty
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

-- Enable RLS on the new table
ALTER TABLE warranty_fixed_prices ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can read warranty fixed prices"
  ON warranty_fixed_prices
  FOR SELECT
  TO public
  USING (true);

-- Create function to get exact warranty price
CREATE OR REPLACE FUNCTION get_exact_warranty_price(
  product_id integer,
  months integer,
  currency text
) RETURNS numeric AS $$
DECLARE
  exact_price numeric;
BEGIN
  -- Look up exact price from the table
  SELECT price INTO exact_price
  FROM warranty_fixed_prices
  WHERE warranty_fixed_prices.product_id = get_exact_warranty_price.product_id
    AND warranty_fixed_prices.months = get_exact_warranty_price.months
    AND warranty_fixed_prices.currency = get_exact_warranty_price.currency;
  
  -- Return the exact price if found, otherwise NULL
  RETURN exact_price;
END;
$$ LANGUAGE plpgsql;