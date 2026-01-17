-- Update White CCT product prices and Stripe price IDs one by one
DO $$
BEGIN
  -- Update 5-meter CCT variant
  BEGIN
    -- Update product_prices table
    UPDATE product_prices
    SET is_active = false
    WHERE product_id = 2
      AND variant_id = 'cct-5'
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
      2,
      'cct-5',
      'CZK',
      4350,
      true,
      clock_timestamp()
    );
    
    -- Update products table
    UPDATE products
    SET variants = jsonb_set(
      variants,
      ARRAY[(
        SELECT (ordinality - 1)::text
        FROM jsonb_array_elements(variants) WITH ORDINALITY
        WHERE value->>'id' = 'cct-5'
      )],
      jsonb_build_object(
        'id', 'cct-5',
        'length', 5,
        'price', 4350,
        'stockStatus', 'in_stock',
        'stripePriceId', 'price_1RRGuJKVsLiX4gAouApc9AHB'
      )
    )
    WHERE id = 2;
    
    RAISE NOTICE 'Updated cct-5 variant';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating cct-5 variant: %', SQLERRM;
  END;
  
  -- Update 10-meter CCT variant
  BEGIN
    -- Update product_prices table
    UPDATE product_prices
    SET is_active = false
    WHERE product_id = 2
      AND variant_id = 'cct-10'
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
      2,
      'cct-10',
      'CZK',
      7850,
      true,
      clock_timestamp()
    );
    
    -- Update products table
    UPDATE products
    SET variants = jsonb_set(
      variants,
      ARRAY[(
        SELECT (ordinality - 1)::text
        FROM jsonb_array_elements(variants) WITH ORDINALITY
        WHERE value->>'id' = 'cct-10'
      )],
      jsonb_build_object(
        'id', 'cct-10',
        'length', 10,
        'price', 7850,
        'stockStatus', 'in_stock',
        'stripePriceId', 'price_1RRGuJKVsLiX4gAoIQTrRMtc'
      )
    )
    WHERE id = 2;
    
    RAISE NOTICE 'Updated cct-10 variant';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating cct-10 variant: %', SQLERRM;
  END;
  
  -- Update 15-meter CCT variant
  BEGIN
    -- Update product_prices table
    UPDATE product_prices
    SET is_active = false
    WHERE product_id = 2
      AND variant_id = 'cct-15'
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
      2,
      'cct-15',
      'CZK',
      11500,
      true,
      clock_timestamp()
    );
    
    -- Update products table
    UPDATE products
    SET variants = jsonb_set(
      variants,
      ARRAY[(
        SELECT (ordinality - 1)::text
        FROM jsonb_array_elements(variants) WITH ORDINALITY
        WHERE value->>'id' = 'cct-15'
      )],
      jsonb_build_object(
        'id', 'cct-15',
        'length', 15,
        'price', 11500,
        'stockStatus', 'in_stock',
        'stripePriceId', 'price_1RRGuJKVsLiX4gAoYc5sUPdJ'
      )
    )
    WHERE id = 2;
    
    RAISE NOTICE 'Updated cct-15 variant';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating cct-15 variant: %', SQLERRM;
  END;
  
  -- Update 20-meter CCT variant
  BEGIN
    -- Update product_prices table
    UPDATE product_prices
    SET is_active = false
    WHERE product_id = 2
      AND variant_id = 'cct-20'
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
      2,
      'cct-20',
      'CZK',
      15100,
      true,
      clock_timestamp()
    );
    
    -- Update products table
    UPDATE products
    SET variants = jsonb_set(
      variants,
      ARRAY[(
        SELECT (ordinality - 1)::text
        FROM jsonb_array_elements(variants) WITH ORDINALITY
        WHERE value->>'id' = 'cct-20'
      )],
      jsonb_build_object(
        'id', 'cct-20',
        'length', 20,
        'price', 15100,
        'stockStatus', 'in_stock',
        'stripePriceId', 'price_1RRGuJKVsLiX4gAoVTFh8aJ7'
      )
    )
    WHERE id = 2;
    
    RAISE NOTICE 'Updated cct-20 variant';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating cct-20 variant: %', SQLERRM;
  END;
  
  -- Update 25-meter CCT variant
  BEGIN
    -- Update product_prices table
    UPDATE product_prices
    SET is_active = false
    WHERE product_id = 2
      AND variant_id = 'cct-25'
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
      2,
      'cct-25',
      'CZK',
      18700,
      true,
      clock_timestamp()
    );
    
    -- Update products table
    UPDATE products
    SET variants = jsonb_set(
      variants,
      ARRAY[(
        SELECT (ordinality - 1)::text
        FROM jsonb_array_elements(variants) WITH ORDINALITY
        WHERE value->>'id' = 'cct-25'
      )],
      jsonb_build_object(
        'id', 'cct-25',
        'length', 25,
        'price', 18700,
        'stockStatus', 'in_stock',
        'stripePriceId', 'price_1RRGuJKVsLiX4gAoxFj37LDX'
      )
    )
    WHERE id = 2;
    
    RAISE NOTICE 'Updated cct-25 variant';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating cct-25 variant: %', SQLERRM;
  END;
  
  -- Update 30-meter CCT variant
  BEGIN
    -- Update product_prices table
    UPDATE product_prices
    SET is_active = false
    WHERE product_id = 2
      AND variant_id = 'cct-30'
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
      2,
      'cct-30',
      'CZK',
      22300,
      true,
      clock_timestamp()
    );
    
    -- Update products table
    UPDATE products
    SET variants = jsonb_set(
      variants,
      ARRAY[(
        SELECT (ordinality - 1)::text
        FROM jsonb_array_elements(variants) WITH ORDINALITY
        WHERE value->>'id' = 'cct-30'
      )],
      jsonb_build_object(
        'id', 'cct-30',
        'length', 30,
        'price', 22300,
        'stockStatus', 'in_stock',
        'stripePriceId', 'price_1RRGuJKVsLiX4gAox64j3r32'
      )
    )
    WHERE id = 2;
    
    RAISE NOTICE 'Updated cct-30 variant';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating cct-30 variant: %', SQLERRM;
  END;
  
  -- Update product ID
  BEGIN
    UPDATE products
    SET stripeProductId = 'prod_SLys9BCrhGl9Yz'
    WHERE id = 2;
    
    RAISE NOTICE 'Updated product ID to prod_SLys9BCrhGl9Yz';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error updating product ID: %', SQLERRM;
  END;
  
  -- Force a complete refresh of the products table
  BEGIN
    UPDATE products
    SET updated_at = now()
    WHERE id = 2;
    
    RAISE NOTICE 'Forced refresh of products table';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error forcing refresh: %', SQLERRM;
  END;
END $$;

-- Verify the updates
DO $$
DECLARE
  v_variant_id text;
  v_expected_price numeric;
  v_expected_stripe_id text;
  v_website_price numeric;
  v_website_stripe_id text;
BEGIN
  RAISE NOTICE 'Verification of White CCT prices:';
  
  FOR v_variant_id, v_expected_price, v_expected_stripe_id IN 
    VALUES 
      ('cct-5', 4350, 'price_1RRGuJKVsLiX4gAouApc9AHB'),
      ('cct-10', 7850, 'price_1RRGuJKVsLiX4gAoIQTrRMtc'),
      ('cct-15', 11500, 'price_1RRGuJKVsLiX4gAoYc5sUPdJ'),
      ('cct-20', 15100, 'price_1RRGuJKVsLiX4gAoVTFh8aJ7'),
      ('cct-25', 18700, 'price_1RRGuJKVsLiX4gAoxFj37LDX'),
      ('cct-30', 22300, 'price_1RRGuJKVsLiX4gAox64j3r32')
  LOOP
    -- Get price and Stripe ID from products table
    SELECT 
      (value->>'price')::numeric,
      value->>'stripePriceId'
    INTO 
      v_website_price,
      v_website_stripe_id
    FROM products p, jsonb_array_elements(p.variants) AS value
    WHERE p.id = 2
      AND value->>'id' = v_variant_id;
    
    RAISE NOTICE 'Variant: %, Expected Price: %, Actual: %, Expected Stripe ID: %, Actual: %', 
      v_variant_id, v_expected_price, v_website_price, v_expected_stripe_id, v_website_stripe_id;
  END LOOP;
  
  -- Verify product ID
  DECLARE
    v_product_id text;
  BEGIN
    SELECT stripeProductId INTO v_product_id FROM products WHERE id = 2;
    RAISE NOTICE 'Product ID: %, Expected: %', v_product_id, 'prod_SLys9BCrhGl9Yz';
  END;
END $$;