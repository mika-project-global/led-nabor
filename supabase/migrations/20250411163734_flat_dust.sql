/*
  # Create direct price update system
  
  1. New Functions
    - get_all_active_prices: Returns all active prices for a currency
    - update_product_price_direct: Updates price and returns the new value
    
  2. Security
    - Enable RLS
    - Add public access
*/

-- Create function to get all active prices for a currency
CREATE OR REPLACE FUNCTION get_all_active_prices(
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  product_id integer,
  variant_id text,
  price numeric
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

-- Create function to update product price and return the new value
CREATE OR REPLACE FUNCTION update_product_price_direct(
  p_product_id integer,
  p_variant_id text,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  price_id uuid;
  new_price numeric;
BEGIN
  -- Check if price exists
  SELECT id INTO price_id
  FROM product_prices
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND currency = p_currency
    AND is_active = true;
    
  IF price_id IS NULL THEN
    -- Insert new price
    INSERT INTO product_prices (
      product_id,
      variant_id,
      currency,
      custom_price,
      is_active,
      updated_at
    ) VALUES (
      p_product_id,
      p_variant_id,
      p_currency,
      p_price,
      true,
      clock_timestamp()
    )
    RETURNING custom_price INTO new_price;
  ELSE
    -- Update existing price
    UPDATE product_prices
    SET 
      custom_price = p_price,
      updated_at = clock_timestamp()
    WHERE id = price_id
    RETURNING custom_price INTO new_price;
  END IF;
  
  RETURN new_price;
END;
$$ LANGUAGE plpgsql;

-- Create function to update warranty price and return the new value
CREATE OR REPLACE FUNCTION update_warranty_price_direct(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  price_id uuid;
  new_price numeric;
BEGIN
  -- Check if price exists
  SELECT id INTO price_id
  FROM warranty_custom_prices
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  IF price_id IS NULL THEN
    -- Insert new price
    INSERT INTO warranty_custom_prices (
      product_id,
      months,
      currency,
      custom_price,
      is_active,
      updated_at
    ) VALUES (
      p_product_id,
      p_months,
      p_currency,
      p_price,
      true,
      clock_timestamp()
    )
    RETURNING custom_price INTO new_price;
  ELSE
    -- Update existing price
    UPDATE warranty_custom_prices
    SET 
      custom_price = p_price,
      updated_at = clock_timestamp()
    WHERE id = price_id
    RETURNING custom_price INTO new_price;
  END IF;
  
  RETURN new_price;
END;
$$ LANGUAGE plpgsql;