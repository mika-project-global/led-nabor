/*
  # Add admin functions for price management
  
  1. New Functions
    - `get_product_prices`: Returns all product prices for a specific currency
    - `get_warranty_prices`: Returns all warranty prices for a specific currency
    - `update_product_price_direct`: Updates a product price directly
    - `update_warranty_price_direct`: Updates a warranty price directly
    
  2. Security
    - Functions are accessible to public
    - Proper error handling
*/

-- Function to get all product prices for a currency
CREATE OR REPLACE FUNCTION get_product_prices(
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  id uuid,
  product_id integer,
  variant_id text,
  currency text,
  custom_price numeric,
  is_active boolean,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.id,
    pp.product_id,
    pp.variant_id,
    pp.currency,
    pp.custom_price,
    pp.is_active,
    pp.updated_at
  FROM product_prices pp
  WHERE pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.product_id, pp.variant_id, pp.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all warranty prices for a currency
CREATE OR REPLACE FUNCTION get_warranty_prices(
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  id uuid,
  product_id integer,
  months integer,
  currency text,
  custom_price numeric,
  is_active boolean,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wp.id,
    wp.product_id,
    wp.months,
    wp.currency,
    wp.custom_price,
    wp.is_active,
    wp.updated_at
  FROM warranty_custom_prices wp
  WHERE wp.currency = p_currency
    AND wp.is_active = true
  ORDER BY wp.product_id, wp.months, wp.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update product price directly
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating product price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update warranty price directly
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
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;