/*
  # Fix price management system
  
  1. Changes
    - Fix issue with prices reverting back to original values
    - Improve price update function to properly save changes
    - Add better error handling and logging
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create or replace function to update product price with proper synchronization
CREATE OR REPLACE FUNCTION update_product_price_direct(
  p_product_id integer,
  p_variant_id text,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  variant_index integer;
  variant_length integer;
  stock_status text;
  stripe_price_id text;
BEGIN
  -- Log the request for debugging
  RAISE NOTICE 'Updating product price: product_id=%, variant_id=%, currency=%, price=%', 
    p_product_id, p_variant_id, p_currency, p_price;

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
  
  -- If updating CZK price, also update the products table
  IF p_currency = 'CZK' THEN
    -- Find the variant index, length, and other properties
    SELECT 
      (ordinality - 1)::integer,
      (value->>'length')::integer,
      COALESCE(value->>'stockStatus', 'in_stock'),
      value->>'stripePriceId'
    INTO 
      variant_index,
      variant_length,
      stock_status,
      stripe_price_id
    FROM 
      products,
      jsonb_array_elements(variants) WITH ORDINALITY
    WHERE 
      id = p_product_id AND
      value->>'id' = p_variant_id;
    
    -- Update the products table if variant found
    IF variant_index IS NOT NULL THEN
      UPDATE products
      SET 
        variants = jsonb_set(
          variants,
          ARRAY[variant_index::text],
          jsonb_build_object(
            'id', p_variant_id,
            'length', variant_length,
            'price', p_price,
            'stockStatus', stock_status,
            'stripePriceId', stripe_price_id
          )
        ),
        updated_at = now()
      WHERE id = p_product_id;
      
      RAISE NOTICE 'Updated products table: variant_index=%, new_price=%', variant_index, p_price;
    ELSE
      RAISE NOTICE 'Variant not found in products table: product_id=%, variant_id=%', p_product_id, p_variant_id;
    END IF;
  END IF;
  
  -- Verify the update was successful
  DECLARE
    verified_price numeric;
  BEGIN
    -- Check product_prices table
    SELECT pp.custom_price INTO verified_price
    FROM product_prices pp
    WHERE pp.product_id = p_product_id
      AND pp.variant_id = p_variant_id
      AND pp.currency = p_currency
      AND pp.is_active = true
    ORDER BY pp.updated_at DESC
    LIMIT 1;
    
    IF verified_price = p_price THEN
      RAISE NOTICE 'Price update verified in product_prices: %', verified_price;
    ELSE
      RAISE NOTICE 'Price verification failed in product_prices: expected=%, actual=%', p_price, verified_price;
    END IF;
    
    -- Check products table
    IF p_currency = 'CZK' THEN
      SELECT (value->>'price')::numeric INTO verified_price
      FROM products p, jsonb_array_elements(p.variants) AS value
      WHERE p.id = p_product_id
        AND value->>'id' = p_variant_id;
      
      IF verified_price = p_price THEN
        RAISE NOTICE 'Price update verified in products table: %', verified_price;
      ELSE
        RAISE NOTICE 'Price verification failed in products table: expected=%, actual=%', p_price, verified_price;
      END IF;
    END IF;
  END;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating product price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to fix all product prices
CREATE OR REPLACE FUNCTION fix_all_product_prices() RETURNS void AS $$
DECLARE
  product RECORD;
  variant RECORD;
BEGIN
  -- First, deactivate all existing product_prices
  UPDATE product_prices SET is_active = false;
  
  -- For each product
  FOR product IN SELECT * FROM products
  LOOP
    -- For each variant
    FOR variant IN SELECT * FROM jsonb_to_recordset(product.variants) AS x(id text, length integer, price numeric, stockStatus text)
    LOOP
      -- Insert price record
      INSERT INTO product_prices (
        product_id,
        variant_id,
        currency,
        custom_price,
        is_active,
        updated_at
      ) VALUES (
        product.id,
        variant.id,
        'CZK',
        variant.price,
        true,
        clock_timestamp()
      );
    END LOOP;
  END LOOP;
  
  -- Update products table from product_prices
  UPDATE products p
  SET variants = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', v->>'id',
        'length', (v->>'length')::integer,
        'price', COALESCE(pp.custom_price, (v->>'price')::numeric),
        'stockStatus', COALESCE(v->>'stockStatus', 'in_stock'),
        'stripePriceId', v->>'stripePriceId'
      )
    )
    FROM jsonb_array_elements(p.variants) AS v
    LEFT JOIN product_prices pp ON 
      pp.product_id = p.id AND 
      pp.variant_id = v->>'id' AND 
      pp.currency = 'CZK' AND
      pp.is_active = true
  )
  WHERE EXISTS (
    SELECT 1 
    FROM product_prices pp 
    WHERE pp.product_id = p.id AND pp.currency = 'CZK' AND pp.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to debug product price
CREATE OR REPLACE FUNCTION debug_product_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  source text,
  price numeric,
  details jsonb
) AS $$
DECLARE
  custom_price numeric;
  product_price numeric;
BEGIN
  -- Check product_prices table
  SELECT pp.custom_price INTO custom_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;
  
  IF custom_price IS NOT NULL THEN
    RETURN QUERY SELECT 
      'product_prices'::text, 
      custom_price,
      jsonb_build_object(
        'product_id', p_product_id,
        'variant_id', p_variant_id,
        'currency', p_currency
      );
    RETURN;
  END IF;
  
  -- Check products table
  SELECT (value->>'price')::numeric INTO product_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;
  
  IF product_price IS NOT NULL THEN
    RETURN QUERY SELECT 
      'products table'::text, 
      product_price,
      jsonb_build_object(
        'product_id', p_product_id,
        'variant_id', p_variant_id
      );
    RETURN;
  END IF;
  
  -- If nothing found, return 0
  RETURN QUERY SELECT 
    'no price found'::text, 
    0::numeric,
    jsonb_build_object(
      'product_id', p_product_id,
      'variant_id', p_variant_id,
      'currency', p_currency
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the 10-meter RGB+CCT product price to 9900 CZK
DO $$
BEGIN
  -- First update the price in product_prices table
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = 1
    AND variant_id = 'rgb-10'
    AND currency = 'CZK'
    AND is_active = true;
    
  INSERT INTO product_prices (
    product_id,
    variant_id,
    currency,
    custom_price,
    is_active,
    updated_at
  ) VALUES (
    1,
    'rgb-10',
    'CZK',
    9900,
    true,
    clock_timestamp()
  );
  
  -- Then update the products table
  UPDATE products
  SET variants = jsonb_set(
    variants,
    ARRAY[(
      SELECT (ordinality - 1)::text
      FROM jsonb_array_elements(variants) WITH ORDINALITY
      WHERE value->>'id' = 'rgb-10'
    )],
    jsonb_build_object(
      'id', 'rgb-10',
      'length', 10,
      'price', 9900,
      'stockStatus', 'in_stock',
      'stripePriceId', (
        SELECT value->>'stripePriceId'
        FROM jsonb_array_elements(variants) AS value
        WHERE value->>'id' = 'rgb-10'
      )
    )
  )
  WHERE id = 1;
  
  RAISE NOTICE 'Updated 10-meter RGB+CCT product price to 9900 CZK';
END $$;