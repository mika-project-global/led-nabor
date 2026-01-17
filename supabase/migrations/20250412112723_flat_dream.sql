/*
  # Fix price admin integration with website
  
  1. Changes
    - Create functions to properly connect admin panel with pricing system
    - Add functions to retrieve prices from product_prices table
    - Add functions to update prices in product_prices table
    - Ensure proper synchronization between tables
*/

-- Create function to get product prices for admin panel
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
  ORDER BY pp.product_id, pp.variant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get warranty prices for admin panel
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
  ORDER BY wp.product_id, wp.months;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update product price directly
CREATE OR REPLACE FUNCTION update_product_price_direct(
  p_product_id integer,
  p_variant_id text,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
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
  
  -- Also update the products table to keep it in sync
  UPDATE products
  SET variants = jsonb_set(
    variants,
    ARRAY[
      (
        SELECT ordinality - 1
        FROM jsonb_array_elements(variants) WITH ORDINALITY
        WHERE value->>'id' = p_variant_id
      )::text
    ],
    jsonb_build_object(
      'id', p_variant_id,
      'length', (
        SELECT (value->>'length')::integer
        FROM jsonb_array_elements(variants)
        WHERE value->>'id' = p_variant_id
      ),
      'price', p_price
    )
  )
  WHERE id = p_product_id
    AND p_currency = 'CZK';  -- Only update products table for CZK currency
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating product price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update warranty price directly
CREATE OR REPLACE FUNCTION update_warranty_price_direct(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  warranty_id uuid;
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
  
  -- Also update the warranty_policies table to keep it in sync
  IF p_currency = 'CZK' THEN
    SELECT id INTO warranty_id
    FROM warranty_policies
    WHERE product_id = p_product_id
      AND months = p_months;
      
    IF warranty_id IS NOT NULL THEN
      UPDATE warranty_policies
      SET fixed_price = p_price
      WHERE id = warranty_id;
    END IF;
  END IF;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;