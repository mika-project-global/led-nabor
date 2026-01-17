/*
  # Update White CCT product prices and Stripe price IDs
  
  1. Changes
    - Update prices for all White CCT product variants
    - Add Stripe price IDs for each variant
    - Update product ID to prod_SLys9BCrhGl9Yz
    - Ensure prices are correctly synchronized between tables
*/

-- Temporarily disable the sync_prices_trigger to prevent automatic synchronization
DROP TRIGGER IF EXISTS sync_prices_trigger ON product_prices;

-- Update the White CCT product prices and Stripe price IDs
DO $$
DECLARE
  v_variant_id text;
  v_price numeric;
  v_stripe_price_id text;
  v_variant_index integer;
  v_length integer;
  v_stock_status text;
  v_old_price numeric;
BEGIN
  -- Define the new prices and Stripe price IDs for White CCT
  FOR v_variant_id, v_price, v_stripe_price_id IN 
    VALUES 
      ('cct-5', 4350, 'price_1RRGuJKVsLiX4gAouApc9AHB'),
      ('cct-10', 7850, 'price_1RRGuJKVsLiX4gAoIQTrRMtc'),
      ('cct-15', 11500, 'price_1RRGuJKVsLiX4gAoYc5sUPdJ'),
      ('cct-20', 15100, 'price_1RRGuJKVsLiX4gAoVTFh8aJ7'),
      ('cct-25', 18700, 'price_1RRGuJKVsLiX4gAoxFj37LDX'),
      ('cct-30', 22300, 'price_1RRGuJKVsLiX4gAox64j3r32')
  LOOP
    -- Get variant length based on variant ID
    CASE 
      WHEN v_variant_id = 'cct-5' THEN v_length := 5;
      WHEN v_variant_id = 'cct-10' THEN v_length := 10;
      WHEN v_variant_id = 'cct-15' THEN v_length := 15;
      WHEN v_variant_id = 'cct-20' THEN v_length := 20;
      WHEN v_variant_id = 'cct-25' THEN v_length := 25;
      WHEN v_variant_id = 'cct-30' THEN v_length := 30;
      ELSE v_length := 5;
    END CASE;
    
    -- Get the current price for logging
    SELECT pp.custom_price INTO v_old_price
    FROM product_prices pp
    WHERE pp.product_id = 2
      AND pp.variant_id = v_variant_id
      AND pp.currency = 'CZK'
      AND pp.is_active = true
    ORDER BY pp.updated_at DESC
    LIMIT 1;
    
    -- If no current price, set to 0 for logging
    IF v_old_price IS NULL THEN
      v_old_price := 0;
    END IF;
    
    -- Get the variant index and stock status for products table update
    SELECT 
      (ordinality - 1)::integer,
      COALESCE(value->>'stockStatus', 'in_stock')
    INTO 
      v_variant_index,
      v_stock_status
    FROM 
      products,
      jsonb_array_elements(variants) WITH ORDINALITY
    WHERE 
      id = 2 AND
      value->>'id' = v_variant_id;
    
    -- 1. Update product_prices table (for admin panel)
    UPDATE product_prices
    SET is_active = false
    WHERE product_id = 2
      AND variant_id = v_variant_id
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
      v_variant_id,
      'CZK',
      v_price,
      true,
      clock_timestamp()
    );
    
    -- 2. Update products table (for website frontend)
    IF v_variant_index IS NOT NULL THEN
      UPDATE products
      SET variants = jsonb_set(
        variants,
        ARRAY[v_variant_index::text],
        jsonb_build_object(
          'id', v_variant_id,
          'length', v_length,
          'price', v_price,
          'stockStatus', v_stock_status,
          'stripePriceId', v_stripe_price_id
        )
      )
      WHERE id = 2;
    END IF;
    
    -- Log the price update operation
    BEGIN
      INSERT INTO price_operations_log (
        operation_type,
        product_id,
        variant_id,
        currency,
        old_price,
        new_price,
        admin_panel_price,
        website_price,
        success,
        error_message
      ) VALUES (
        'update_white_cct_prices',
        2,
        v_variant_id,
        'CZK',
        v_old_price,
        v_price,
        v_price,
        v_price,
        true,
        NULL
      );
    EXCEPTION WHEN OTHERS THEN
      -- If logging fails, continue with the price updates
      RAISE NOTICE 'Failed to log price operation: %', SQLERRM;
    END;
  END LOOP;
  
  -- Update product ID in products table
  UPDATE products
  SET stripeProductId = 'prod_SLys9BCrhGl9Yz'
  WHERE id = 2;
  
  -- Force a complete refresh of the products table to ensure consistency
  UPDATE products
  SET updated_at = now()
  WHERE id = 2;
  
  RAISE NOTICE 'White CCT price update completed';
END $$;

-- Direct update to products table to ensure all variants have the correct prices and Stripe IDs
DO $$
DECLARE
  v_variants jsonb;
BEGIN
  -- Create a new variants array with updated prices and Stripe price IDs
  v_variants := jsonb_build_array(
    jsonb_build_object(
      'id', 'cct-5',
      'length', 5,
      'price', 4350,
      'stockStatus', 'in_stock',
      'stripePriceId', 'price_1RRGuJKVsLiX4gAouApc9AHB'
    ),
    jsonb_build_object(
      'id', 'cct-10',
      'length', 10,
      'price', 7850,
      'stockStatus', 'in_stock',
      'stripePriceId', 'price_1RRGuJKVsLiX4gAoIQTrRMtc'
    ),
    jsonb_build_object(
      'id', 'cct-15',
      'length', 15,
      'price', 11500,
      'stockStatus', 'in_stock',
      'stripePriceId', 'price_1RRGuJKVsLiX4gAoYc5sUPdJ'
    ),
    jsonb_build_object(
      'id', 'cct-20',
      'length', 20,
      'price', 15100,
      'stockStatus', 'in_stock',
      'stripePriceId', 'price_1RRGuJKVsLiX4gAoVTFh8aJ7'
    ),
    jsonb_build_object(
      'id', 'cct-25',
      'length', 25,
      'price', 18700,
      'stockStatus', 'in_stock',
      'stripePriceId', 'price_1RRGuJKVsLiX4gAoxFj37LDX'
    ),
    jsonb_build_object(
      'id', 'cct-30',
      'length', 30,
      'price', 22300,
      'stockStatus', 'in_stock',
      'stripePriceId', 'price_1RRGuJKVsLiX4gAox64j3r32'
    )
  );
  
  -- Update the entire variants array at once
  UPDATE products
  SET 
    variants = v_variants,
    stripeProductId = 'prod_SLys9BCrhGl9Yz',
    updated_at = now()
  WHERE id = 2;
  
  RAISE NOTICE 'Direct update of products table completed';
END $$;

-- Recreate the sync_prices_trigger
CREATE TRIGGER sync_prices_trigger
  AFTER INSERT OR UPDATE ON product_prices
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_sync_prices();

-- Verify the updates
DO $$
DECLARE
  v_variant_id text;
  v_expected_price numeric;
  v_expected_stripe_id text;
  v_admin_price numeric;
  v_website_price numeric;
  v_website_stripe_id text;
  v_all_match boolean := true;
BEGIN
  RAISE NOTICE 'Final price verification for White CCT:';
  
  FOR v_variant_id, v_expected_price, v_expected_stripe_id IN 
    VALUES 
      ('cct-5', 4350, 'price_1RRGuJKVsLiX4gAouApc9AHB'),
      ('cct-10', 7850, 'price_1RRGuJKVsLiX4gAoIQTrRMtc'),
      ('cct-15', 11500, 'price_1RRGuJKVsLiX4gAoYc5sUPdJ'),
      ('cct-20', 15100, 'price_1RRGuJKVsLiX4gAoVTFh8aJ7'),
      ('cct-25', 18700, 'price_1RRGuJKVsLiX4gAoxFj37LDX'),
      ('cct-30', 22300, 'price_1RRGuJKVsLiX4gAox64j3r32')
  LOOP
    -- Get price from product_prices (admin panel)
    SELECT pp.custom_price INTO v_admin_price
    FROM product_prices pp
    WHERE pp.product_id = 2
      AND pp.variant_id = v_variant_id
      AND pp.currency = 'CZK'
      AND pp.is_active = true
    ORDER BY pp.updated_at DESC
    LIMIT 1;
    
    -- Get price and Stripe ID from products table (website)
    SELECT 
      (value->>'price')::numeric,
      value->>'stripePriceId'
    INTO 
      v_website_price,
      v_website_stripe_id
    FROM products p, jsonb_array_elements(p.variants) AS value
    WHERE p.id = 2
      AND value->>'id' = v_variant_id;
    
    IF v_admin_price != v_expected_price OR v_website_price != v_expected_price OR v_website_stripe_id != v_expected_stripe_id THEN
      v_all_match := false;
    END IF;
    
    RAISE NOTICE 'Variant: %, Expected Price: %, Admin: %, Website: %, Expected Stripe ID: %, Website Stripe ID: %', 
      v_variant_id, v_expected_price, v_admin_price, v_website_price, v_expected_stripe_id, v_website_stripe_id;
  END LOOP;
  
  -- Verify product ID
  DECLARE
    v_product_id text;
  BEGIN
    SELECT stripeProductId INTO v_product_id FROM products WHERE id = 2;
    
    RAISE NOTICE 'Product ID: %, Expected: %', v_product_id, 'prod_SLys9BCrhGl9Yz';
    
    IF v_product_id != 'prod_SLys9BCrhGl9Yz' THEN
      v_all_match := false;
    END IF;
  END;
  
  IF v_all_match THEN
    RAISE NOTICE 'All prices and Stripe IDs match the expected values!';
  ELSE
    RAISE NOTICE 'Some prices or Stripe IDs do not match the expected values!';
  END IF;
END $$;