/*
  # Fix price management system
  
  1. Changes
    - Create improved functions for price management
    - Add direct update functions with proper error handling
    - Add functions to retrieve prices with fallbacks
    - Fix timestamp handling for proper ordering
*/

-- Create improved function to update product price
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
  -- First deactivate any existing prices
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
    AND currency = p_currency
    AND is_active = true;
    
  -- Insert new price record
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
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating product price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved function to update warranty price
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
  -- First deactivate any existing prices
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  -- Insert new price record
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
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get product price with fallback
CREATE OR REPLACE FUNCTION get_product_price_with_fallback(
  p_product_id integer,
  p_variant_id text,
  p_currency text
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  default_price numeric;
BEGIN
  -- Try to get custom price for the specified currency
  SELECT pp.custom_price INTO custom_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;
  
  -- If found, return it
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- If not found and currency is not CZK, try to get CZK price as fallback
  IF p_currency != 'CZK' THEN
    SELECT pp.custom_price INTO default_price
    FROM product_prices pp
    WHERE pp.product_id = p_product_id
      AND pp.variant_id = p_variant_id
      AND pp.currency = 'CZK'
      AND pp.is_active = true
    ORDER BY pp.updated_at DESC
    LIMIT 1;
    
    -- If CZK price found, return it (caller will convert)
    IF default_price IS NOT NULL THEN
      RETURN default_price;
    END IF;
  END IF;
  
  -- If no price found, return NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to get warranty price with fallback
CREATE OR REPLACE FUNCTION get_warranty_price_with_fallback(
  p_product_id integer,
  p_months integer,
  p_currency text
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  default_price numeric;
BEGIN
  -- Try to get custom price for the specified currency
  SELECT wp.custom_price INTO custom_price
  FROM warranty_custom_prices wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months
    AND wp.currency = p_currency
    AND wp.is_active = true
  ORDER BY wp.updated_at DESC
  LIMIT 1;
  
  -- If found, return it
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- If not found and currency is not CZK, try to get CZK price as fallback
  IF p_currency != 'CZK' THEN
    SELECT wp.custom_price INTO default_price
    FROM warranty_custom_prices wp
    WHERE wp.product_id = p_product_id
      AND wp.months = p_months
      AND wp.currency = 'CZK'
      AND wp.is_active = true
    ORDER BY wp.updated_at DESC
    LIMIT 1;
    
    -- If CZK price found, return it (caller will convert)
    IF default_price IS NOT NULL THEN
      RETURN default_price;
    END IF;
  END IF;
  
  -- If no price found, return NULL
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;