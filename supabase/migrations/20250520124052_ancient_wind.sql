/*
  # Update RGB+CCT product prices
  
  1. Changes
    - Update prices for RGB+CCT product variants
    - Set exact prices for each length variant
    - Ensure prices are correctly synchronized between tables
    
  2. Security
    - Maintain existing RLS policies
*/

-- Update the RGB+CCT product prices
DO $$
DECLARE
  success boolean;
BEGIN
  -- Update 5-meter RGB+CCT price
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = 1
    AND variant_id = 'rgb-5'
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
    'rgb-5',
    'CZK',
    5350,
    true,
    clock_timestamp()
  );
  
  -- Update 10-meter RGB+CCT price
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
    9850,
    true,
    clock_timestamp()
  );
  
  -- Update 15-meter RGB+CCT price
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = 1
    AND variant_id = 'rgb-15'
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
    'rgb-15',
    'CZK',
    14350,
    true,
    clock_timestamp()
  );
  
  -- Update 20-meter RGB+CCT price
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = 1
    AND variant_id = 'rgb-20'
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
    'rgb-20',
    'CZK',
    18850,
    true,
    clock_timestamp()
  );
  
  -- Update 25-meter RGB+CCT price
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = 1
    AND variant_id = 'rgb-25'
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
    'rgb-25',
    'CZK',
    23350,
    true,
    clock_timestamp()
  );
  
  -- Update 30-meter RGB+CCT price
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = 1
    AND variant_id = 'rgb-30'
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
    'rgb-30',
    'CZK',
    27850,
    true,
    clock_timestamp()
  );
  
  -- Update the products table with the new prices
  UPDATE products
  SET variants = jsonb_set(
    variants,
    ARRAY[(
      SELECT (ordinality - 1)::text
      FROM jsonb_array_elements(variants) WITH ORDINALITY
      WHERE value->>'id' = 'rgb-5'
    )],
    jsonb_build_object(
      'id', 'rgb-5',
      'length', 5,
      'price', 5350,
      'stockStatus', 'in_stock',
      'stripePriceId', (
        SELECT value->>'stripePriceId'
        FROM jsonb_array_elements(variants) AS value
        WHERE value->>'id' = 'rgb-5'
      )
    )
  )
  WHERE id = 1;
  
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
      'price', 9850,
      'stockStatus', 'in_stock',
      'stripePriceId', (
        SELECT value->>'stripePriceId'
        FROM jsonb_array_elements(variants) AS value
        WHERE value->>'id' = 'rgb-10'
      )
    )
  )
  WHERE id = 1;
  
  UPDATE products
  SET variants = jsonb_set(
    variants,
    ARRAY[(
      SELECT (ordinality - 1)::text
      FROM jsonb_array_elements(variants) WITH ORDINALITY
      WHERE value->>'id' = 'rgb-15'
    )],
    jsonb_build_object(
      'id', 'rgb-15',
      'length', 15,
      'price', 14350,
      'stockStatus', 'in_stock',
      'stripePriceId', (
        SELECT value->>'stripePriceId'
        FROM jsonb_array_elements(variants) AS value
        WHERE value->>'id' = 'rgb-15'
      )
    )
  )
  WHERE id = 1;
  
  UPDATE products
  SET variants = jsonb_set(
    variants,
    ARRAY[(
      SELECT (ordinality - 1)::text
      FROM jsonb_array_elements(variants) WITH ORDINALITY
      WHERE value->>'id' = 'rgb-20'
    )],
    jsonb_build_object(
      'id', 'rgb-20',
      'length', 20,
      'price', 18850,
      'stockStatus', 'in_stock',
      'stripePriceId', (
        SELECT value->>'stripePriceId'
        FROM jsonb_array_elements(variants) AS value
        WHERE value->>'id' = 'rgb-20'
      )
    )
  )
  WHERE id = 1;
  
  UPDATE products
  SET variants = jsonb_set(
    variants,
    ARRAY[(
      SELECT (ordinality - 1)::text
      FROM jsonb_array_elements(variants) WITH ORDINALITY
      WHERE value->>'id' = 'rgb-25'
    )],
    jsonb_build_object(
      'id', 'rgb-25',
      'length', 25,
      'price', 23350,
      'stockStatus', 'in_stock',
      'stripePriceId', (
        SELECT value->>'stripePriceId'
        FROM jsonb_array_elements(variants) AS value
        WHERE value->>'id' = 'rgb-25'
      )
    )
  )
  WHERE id = 1;
  
  UPDATE products
  SET variants = jsonb_set(
    variants,
    ARRAY[(
      SELECT (ordinality - 1)::text
      FROM jsonb_array_elements(variants) WITH ORDINALITY
      WHERE value->>'id' = 'rgb-30'
    )],
    jsonb_build_object(
      'id', 'rgb-30',
      'length', 30,
      'price', 27850,
      'stockStatus', 'in_stock',
      'stripePriceId', (
        SELECT value->>'stripePriceId'
        FROM jsonb_array_elements(variants) AS value
        WHERE value->>'id' = 'rgb-30'
      )
    )
  )
  WHERE id = 1;
  
  -- Verify the price updates
  PERFORM sync_prices_between_tables();
  
  RAISE NOTICE 'Updated RGB+CCT product prices according to the new pricing structure';
END $$;

-- Run the sync function to ensure all prices are properly synchronized
SELECT sync_prices_between_tables();