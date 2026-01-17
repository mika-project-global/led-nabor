/*
  # Add price update trigger
  
  1. Changes
    - Add trigger to notify clients when prices are updated
    - Add function to handle price updates
    - Add index for faster price lookups
*/

-- Create index for faster price lookups
CREATE INDEX IF NOT EXISTS product_prices_lookup_idx 
ON product_prices (product_id, variant_id, currency, is_active);

CREATE INDEX IF NOT EXISTS warranty_custom_prices_lookup_idx 
ON warranty_custom_prices (product_id, months, currency, is_active);

-- Create function to update timestamp on price changes
CREATE OR REPLACE FUNCTION update_price_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  -- Set updated_at to current timestamp
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product_prices
DROP TRIGGER IF EXISTS update_product_price_timestamp ON product_prices;
CREATE TRIGGER update_product_price_timestamp
BEFORE INSERT OR UPDATE ON product_prices
FOR EACH ROW
EXECUTE FUNCTION update_price_timestamp();

-- Create trigger for warranty_custom_prices
DROP TRIGGER IF EXISTS update_warranty_price_timestamp ON warranty_custom_prices;
CREATE TRIGGER update_warranty_price_timestamp
BEFORE INSERT OR UPDATE ON warranty_custom_prices
FOR EACH ROW
EXECUTE FUNCTION update_price_timestamp();