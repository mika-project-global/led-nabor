-- Update the RGB+CCT product prices
DO $$
DECLARE
  v_variant_id text;
  v_price numeric;
  v_variant_index integer;
  v_stripe_price_id text;
  v_length integer;
  v_stock_status text;
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
    -- Get variant length based on variant ID
    CASE 
      WHEN v_variant_id = 'rgb-5' THEN v_length := 5;
      WHEN v_variant_id = 'rgb-10' THEN v_length := 10;
      WHEN v_variant_id = 'rgb-15' THEN v_length := 15;
      WHEN v_variant_id = 'rgb-20' THEN v_length := 20;
      WHEN v_variant_id = 'rgb-25' THEN v_length := 25;
      WHEN v_variant_id = 'rgb-30' THEN v_length := 30;
      ELSE v_length := 5;
    END CASE;
    
    -- Get the variant index, Stripe price ID, and stock status for products table update
    SELECT 
      (ordinality - 1)::integer,
      value->>'stripePriceId',
      COALESCE(value->>'stockStatus', 'in_stock')
    INTO 
      v_variant_index,
      v_stripe_price_id,
      v_stock_status
    FROM 
      products,
      jsonb_array_elements(variants) WITH ORDINALITY
    WHERE 
      id = 1 AND
      value->>'id' = v_variant_id;
    
    RAISE NOTICE 'Updating variant % to price % (index: %)', v_variant_id, v_price, v_variant_index;
    
    -- 1. Update product_prices table (for admin panel)
    UPDATE product_prices
    SET is_active = false
    WHERE product_id = 1
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
      1,
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
      WHERE id = 1;
    END IF;
  END LOOP;
  
  -- 3. Force a complete refresh of the products table to ensure consistency
  UPDATE products
  SET updated_at = now()
  WHERE id = 1;
  
  -- 4. Verify the updates
  RAISE NOTICE 'Price verification:';
  
  FOR v_variant_id, v_price IN 
    VALUES 
      ('rgb-5', 5350),
      ('rgb-10', 9850),
      ('rgb-15', 14350),
      ('rgb-20', 18850),
      ('rgb-25', 23350),
      ('rgb-30', 27850)
  LOOP
    -- Verify admin panel price
    DECLARE
      v_admin_price numeric;
      v_website_price numeric;
    BEGIN
      -- Get price from product_prices (admin panel)
      SELECT pp.custom_price INTO v_admin_price
      FROM product_prices pp
      WHERE pp.product_id = 1
        AND pp.variant_id = v_variant_id
        AND pp.currency = 'CZK'
        AND pp.is_active = true
      ORDER BY pp.updated_at DESC
      LIMIT 1;
      
      -- Get price from products table (website)
      SELECT (value->>'price')::numeric INTO v_website_price
      FROM products p, jsonb_array_elements(p.variants) AS value
      WHERE p.id = 1
        AND value->>'id' = v_variant_id;
      
      RAISE NOTICE 'Variant: %, Expected: %, Admin: %, Website: %', 
        v_variant_id, v_price, v_admin_price, v_website_price;
    END;
  END LOOP;
  
  RAISE NOTICE 'Price update completed';
END $$;

-- Create a direct update function for the products table
CREATE OR REPLACE FUNCTION update_product_variant_price(
  p_product_id integer,
  p_variant_id text,
  p_price numeric
) RETURNS boolean AS $$
DECLARE
  v_variant_index integer;
  v_length integer;
  v_stock_status text;
  v_stripe_price_id text;
  v_success boolean := false;
BEGIN
  -- Get variant length based on variant ID
  CASE 
    WHEN p_variant_id = 'rgb-5' THEN v_length := 5;
    WHEN p_variant_id = 'rgb-10' THEN v_length := 10;
    WHEN p_variant_id = 'rgb-15' THEN v_length := 15;
    WHEN p_variant_id = 'rgb-20' THEN v_length := 20;
    WHEN p_variant_id = 'rgb-25' THEN v_length := 25;
    WHEN p_variant_id = 'rgb-30' THEN v_length := 30;
    WHEN p_variant_id = 'cct-5' THEN v_length := 5;
    WHEN p_variant_id = 'cct-10' THEN v_length := 10;
    WHEN p_variant_id = 'cct-15' THEN v_length := 15;
    WHEN p_variant_id = 'cct-20' THEN v_length := 20;
    WHEN p_variant_id = 'cct-25' THEN v_length := 25;
    WHEN p_variant_id = 'cct-30' THEN v_length := 30;
    ELSE v_length := 5;
  END CASE;
  
  -- Get the variant index and other properties
  SELECT 
    (ordinality - 1)::integer,
    COALESCE(value->>'stockStatus', 'in_stock'),
    value->>'stripePriceId'
  INTO 
    v_variant_index,
    v_stock_status,
    v_stripe_price_id
  FROM 
    products,
    jsonb_array_elements(variants) WITH ORDINALITY
  WHERE 
    id = p_product_id AND
    value->>'id' = p_variant_id;
  
  IF v_variant_index IS NULL THEN
    RAISE NOTICE 'Variant not found: product_id=%, variant_id=%', p_product_id, p_variant_id;
    RETURN false;
  END IF;
  
  -- Update the products table directly
  UPDATE products
  SET variants = jsonb_set(
    variants,
    ARRAY[v_variant_index::text],
    jsonb_build_object(
      'id', p_variant_id,
      'length', v_length,
      'price', p_price,
      'stockStatus', v_stock_status,
      'stripePriceId', v_stripe_price_id
    )
  )
  WHERE id = p_product_id;
  
  GET DIAGNOSTICS v_success = ROW_COUNT;
  
  -- Also update the product_prices table
  UPDATE product_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = p_variant_id
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
    p_product_id,
    p_variant_id,
    'CZK',
    p_price,
    true,
    clock_timestamp()
  );
  
  RETURN v_success;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Force direct updates to the products table for each variant
DO $$
DECLARE
  v_success boolean;
BEGIN
  SELECT update_product_variant_price(1, 'rgb-5', 5350) INTO v_success;
  RAISE NOTICE 'Direct update rgb-5: %', v_success;
  
  SELECT update_product_variant_price(1, 'rgb-10', 9850) INTO v_success;
  RAISE NOTICE 'Direct update rgb-10: %', v_success;
  
  SELECT update_product_variant_price(1, 'rgb-15', 14350) INTO v_success;
  RAISE NOTICE 'Direct update rgb-15: %', v_success;
  
  SELECT update_product_variant_price(1, 'rgb-20', 18850) INTO v_success;
  RAISE NOTICE 'Direct update rgb-20: %', v_success;
  
  SELECT update_product_variant_price(1, 'rgb-25', 23350) INTO v_success;
  RAISE NOTICE 'Direct update rgb-25: %', v_success;
  
  SELECT update_product_variant_price(1, 'rgb-30', 27850) INTO v_success;
  RAISE NOTICE 'Direct update rgb-30: %', v_success;
END $$;

-- Final verification of prices
DO $$
DECLARE
  v_variant_id text;
  v_expected_price numeric;
  v_admin_price numeric;
  v_website_price numeric;
  v_all_match boolean := true;
BEGIN
  RAISE NOTICE 'Final price verification:';
  
  FOR v_variant_id, v_expected_price IN 
    VALUES 
      ('rgb-5', 5350),
      ('rgb-10', 9850),
      ('rgb-15', 14350),
      ('rgb-20', 18850),
      ('rgb-25', 23350),
      ('rgb-30', 27850)
  LOOP
    -- Get price from product_prices (admin panel)
    SELECT pp.custom_price INTO v_admin_price
    FROM product_prices pp
    WHERE pp.product_id = 1
      AND pp.variant_id = v_variant_id
      AND pp.currency = 'CZK'
      AND pp.is_active = true
    ORDER BY pp.updated_at DESC
    LIMIT 1;
    
    -- Get price from products table (website)
    SELECT (value->>'price')::numeric INTO v_website_price
    FROM products p, jsonb_array_elements(p.variants) AS value
    WHERE p.id = 1
      AND value->>'id' = v_variant_id;
    
    IF v_admin_price != v_expected_price OR v_website_price != v_expected_price THEN
      v_all_match := false;
    END IF;
    
    RAISE NOTICE 'Variant: %, Expected: %, Admin: %, Website: %, Match: %', 
      v_variant_id, v_expected_price, v_admin_price, v_website_price, 
      (v_admin_price = v_expected_price AND v_website_price = v_expected_price);
  END LOOP;
  
  IF v_all_match THEN
    RAISE NOTICE 'All prices match the expected values!';
  ELSE
    RAISE NOTICE 'Some prices do not match the expected values!';
  END IF;
END $$;