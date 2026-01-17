/*
  # Add direct price update function
  
  1. New Functions
    - update_product_price: Updates price with timestamp
    
  2. Security
    - Enable RLS
    - Add public access
*/

-- Create function to update product price with timestamp
CREATE OR REPLACE FUNCTION update_product_price(
  p_id uuid,
  p_price numeric
) RETURNS void AS $$
BEGIN
  UPDATE product_prices
  SET 
    custom_price = p_price,
    updated_at = clock_timestamp()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to update warranty price with timestamp
CREATE OR REPLACE FUNCTION update_warranty_price(
  p_id uuid,
  p_price numeric
) RETURNS void AS $$
BEGIN
  UPDATE warranty_custom_prices
  SET 
    custom_price = p_price,
    updated_at = clock_timestamp()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get all product prices for a currency
CREATE OR REPLACE FUNCTION get_all_product_prices(
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  product_id integer,
  variant_id text,
  custom_price numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT pp.product_id, pp.variant_id, pp.custom_price
  FROM product_prices pp
  WHERE pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC;
END;
$$ LANGUAGE plpgsql;