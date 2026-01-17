/*
  # Fix price synchronization between admin panel and website
  
  1. Changes
    - Create a function to synchronize prices between tables
    - Add trigger to automatically sync prices when updated
    - Fix specific issue with 10-meter RGB+CCT product price
    - Add better error handling and logging
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create a function to synchronize prices between tables
CREATE OR REPLACE FUNCTION sync_prices_between_tables() RETURNS void AS $$
DECLARE
  product RECORD;
  variant RECORD;
  admin_price numeric;
  website_price numeric;
BEGIN
  RAISE NOTICE 'Starting price synchronization between tables';
  
  -- For each product
  FOR product IN SELECT * FROM products
  LOOP
    -- For each variant
    FOR variant IN SELECT * FROM jsonb_to_recordset(product.variants) AS x(id text, length integer, price numeric)
    LOOP
      -- Get price from product_prices (admin panel)
      SELECT pp.custom_price INTO admin_price
      FROM product_prices pp
      WHERE pp.product_id = product.id
        AND pp.variant_id = variant.id
        AND pp.currency = 'CZK'
        AND pp.is_active = true
      ORDER BY pp.updated_at DESC
      LIMIT 1;
      
      -- Get price from products table (website)
      SELECT (value->>'price')::numeric INTO website_price
      FROM products p, jsonb_array_elements(p.variants) AS value
      WHERE p.id = product.id
        AND value->>'id' = variant.id;
      
      -- If prices don't match, update the products table
      IF admin_price IS NOT NULL AND (website_price IS NULL OR admin_price != website_price) THEN
        RAISE NOTICE 'Syncing price for product_id=%, variant_id=%, admin_price=%, website_price=%',
          product.id, variant.id, admin_price, website_price;
        
        UPDATE products p
        SET variants = jsonb_set(
          variants,
          ARRAY[(
            SELECT (ordinality - 1)::text
            FROM jsonb_array_elements(variants) WITH ORDINALITY
            WHERE value->>'id' = variant.id
          )],
          jsonb_build_object(
            'id', variant.id,
            'length', variant.length,
            'price', admin_price,
            'stockStatus', COALESCE((
              SELECT value->>'stockStatus'
              FROM jsonb_array_elements(p.variants) AS value
              WHERE value->>'id' = variant.id
            ), 'in_stock'),
            'stripePriceId', (
              SELECT value->>'stripePriceId'
              FROM jsonb_array_elements(p.variants) AS value
              WHERE value->>'id' = variant.id
            )
          )
        )
        WHERE id = product.id;
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Price synchronization completed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to verify price updates
CREATE OR REPLACE FUNCTION verify_price_update(
  p_product_id integer,
  p_variant_id text,
  p_price numeric
) RETURNS boolean AS $$
DECLARE
  admin_price numeric;
  website_price numeric;
BEGIN
  -- Get price from product_prices (admin panel)
  SELECT pp.custom_price INTO admin_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = 'CZK'
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;
  
  -- Get price from products table (website)
  SELECT (value->>'price')::numeric INTO website_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;
  
  -- Check if both prices match the expected price
  IF admin_price = p_price AND website_price = p_price THEN
    RAISE NOTICE 'Price verification successful: admin_price=%, website_price=%, expected=%',
      admin_price, website_price, p_price;
    RETURN true;
  ELSE
    RAISE NOTICE 'Price verification failed: admin_price=%, website_price=%, expected=%',
      admin_price, website_price, p_price;
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically sync prices when updated
CREATE OR REPLACE FUNCTION trigger_sync_prices() RETURNS TRIGGER AS $$
BEGIN
  -- Only sync prices when updating product_prices
  IF TG_TABLE_NAME = 'product_prices' THEN
    PERFORM sync_prices_between_tables();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_prices_trigger ON product_prices;
CREATE TRIGGER sync_prices_trigger
  AFTER INSERT OR UPDATE ON product_prices
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_sync_prices();

-- Update the 10-meter RGB+CCT product price to 9900 CZK
DO $$
DECLARE
  success boolean;
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
  
  -- Verify the price update
  SELECT verify_price_update(1, 'rgb-10', 9900) INTO success;
  
  -- If verification failed, try to sync prices
  IF NOT success THEN
    RAISE NOTICE 'Price verification failed, attempting to sync prices';
    PERFORM sync_prices_between_tables();
    
    -- Verify again after sync
    SELECT verify_price_update(1, 'rgb-10', 9900) INTO success;
    
    IF success THEN
      RAISE NOTICE 'Price sync successful';
    ELSE
      RAISE NOTICE 'Price sync failed';
    END IF;
  END IF;
  
  -- Force update the price in both tables to ensure it's set correctly
  UPDATE product_prices
  SET custom_price = 9900
  WHERE product_id = 1
    AND variant_id = 'rgb-10'
    AND currency = 'CZK'
    AND is_active = true;
  
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
  
  RAISE NOTICE 'Forced update of 10-meter RGB+CCT product price to 9900 CZK';
END $$;

-- Run the sync function to ensure all prices are properly synchronized
SELECT sync_prices_between_tables();