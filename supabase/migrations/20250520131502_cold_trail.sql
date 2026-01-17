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

-- Update the RGB+CCT product prices
DO $$
DECLARE
  v_variant_id text;
  v_price numeric;
BEGIN
  -- Define the new prices for each variant
  FOR v_variant_id, v_price IN 
    VALUES 
      ('rgb-5', 5350),
      ('rgb-10', 9850),
      ('rgb-15', 14350),
      ('rgb-20', 18850),
      ('rgb-25', 23350),
      ('rgb-30', 27850)
  LOOP
    -- Update price using the function
    PERFORM update_product_price_direct(1, v_variant_id, 'CZK', v_price);
  END LOOP;
  
  -- Run the sync function to ensure all prices are properly synchronized
  PERFORM sync_prices_between_tables();
  
  RAISE NOTICE 'Price update completed';
END $$;