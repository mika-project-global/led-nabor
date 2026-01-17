/*
  # Optimize price update system
  
  1. Changes
    - Add function to get latest product price
    - Add function to get latest warranty price
    - Add indexes for faster price lookups
    - Add trigger for automatic timestamp updates
*/

-- Create function to get latest product price
CREATE OR REPLACE FUNCTION get_latest_product_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text
) RETURNS numeric AS $$
DECLARE
  latest_price numeric;
BEGIN
  -- Get the most recent active price
  SELECT custom_price INTO latest_price
  FROM product_prices
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND currency = p_currency
    AND is_active = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  RETURN latest_price;
END;
$$ LANGUAGE plpgsql;

-- Create function to get latest warranty price
CREATE OR REPLACE FUNCTION get_latest_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text
) RETURNS numeric AS $$
DECLARE
  latest_price numeric;
BEGIN
  -- Get the most recent active price
  SELECT custom_price INTO latest_price
  FROM warranty_custom_prices
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  RETURN latest_price;
END;
$$ LANGUAGE plpgsql;

-- Create index for faster price lookups if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'product_prices_lookup_idx'
  ) THEN
    CREATE INDEX product_prices_lookup_idx 
    ON product_prices (product_id, variant_id, currency, is_active);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'warranty_custom_prices_lookup_idx'
  ) THEN
    CREATE INDEX warranty_custom_prices_lookup_idx 
    ON warranty_custom_prices (product_id, months, currency, is_active);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'product_prices_updated_idx'
  ) THEN
    CREATE INDEX product_prices_updated_idx 
    ON product_prices (updated_at DESC);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'warranty_prices_updated_idx'
  ) THEN
    CREATE INDEX warranty_prices_updated_idx 
    ON warranty_custom_prices (updated_at DESC);
  END IF;
END $$;

-- Create or replace function to update timestamp on price changes
CREATE OR REPLACE FUNCTION update_price_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Set updated_at to current timestamp with millisecond precision
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product_prices if it doesn't exist
DROP TRIGGER IF EXISTS update_product_price_timestamp ON product_prices;
CREATE TRIGGER update_product_price_timestamp
BEFORE INSERT OR UPDATE ON product_prices
FOR EACH ROW
EXECUTE FUNCTION update_price_timestamp();

-- Create trigger for warranty_custom_prices if it doesn't exist
DROP TRIGGER IF EXISTS update_warranty_price_timestamp ON warranty_custom_prices;
CREATE TRIGGER update_warranty_price_timestamp
BEFORE INSERT OR UPDATE ON warranty_custom_prices
FOR EACH ROW
EXECUTE FUNCTION update_price_timestamp();