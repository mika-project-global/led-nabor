/*
  # Fix price synchronization function
  
  1. Changes
    - Create improved price synchronization function
    - Ensure prices are correctly updated in both tables
    - Add better error handling and logging
*/

-- Create an improved function to update product price with proper synchronization
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
  old_price numeric;
BEGIN
  -- Get the old price for logging
  SELECT pp.custom_price INTO old_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;

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
    END IF;
  END IF;
  
  -- Log the price update operation
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
    'update_price_direct',
    p_product_id,
    p_variant_id,
    p_currency,
    old_price,
    p_price,
    new_price,
    (
      SELECT (value->>'price')::numeric
      FROM products p, jsonb_array_elements(p.variants) AS value
      WHERE p.id = p_product_id
        AND value->>'id' = p_variant_id
    ),
    true,
    NULL
  );
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
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
      'update_price_direct',
      p_product_id,
      p_variant_id,
      p_currency,
      old_price,
      p_price,
      NULL,
      NULL,
      false,
      SQLERRM
    );
    
    RAISE EXCEPTION 'Error updating product price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to update product variant price with Stripe price ID
CREATE OR REPLACE FUNCTION update_product_variant_price_with_stripe(
  p_product_id integer,
  p_variant_id text,
  p_price numeric,
  p_stripe_price_id text
) RETURNS boolean AS $$
DECLARE
  v_variant_index integer;
  v_length integer;
  v_stock_status text;
  v_success boolean := false;
  v_old_price numeric;
BEGIN
  -- Get the old price for logging
  SELECT (value->>'price')::numeric INTO v_old_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;

  -- Get variant length based on variant ID
  CASE 
    WHEN p_variant_id LIKE '%-5' THEN v_length := 5;
    WHEN p_variant_id LIKE '%-10' THEN v_length := 10;
    WHEN p_variant_id LIKE '%-15' THEN v_length := 15;
    WHEN p_variant_id LIKE '%-20' THEN v_length := 20;
    WHEN p_variant_id LIKE '%-25' THEN v_length := 25;
    WHEN p_variant_id LIKE '%-30' THEN v_length := 30;
    ELSE v_length := 5;
  END CASE;
  
  -- Get the variant index and other properties
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
      'stripePriceId', p_stripe_price_id
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
  
  -- Log the operation
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
    'update_price_with_stripe',
    p_product_id,
    p_variant_id,
    'CZK',
    v_old_price,
    p_price,
    (
      SELECT pp.custom_price
      FROM product_prices pp
      WHERE pp.product_id = p_product_id
        AND pp.variant_id = p_variant_id
        AND pp.currency = 'CZK'
        AND pp.is_active = true
      ORDER BY pp.updated_at DESC
      LIMIT 1
    ),
    p_price,
    v_success,
    CASE WHEN v_success THEN NULL ELSE 'Failed to update product variant price' END
  );
  
  RETURN v_success;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
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
      'update_price_with_stripe',
      p_product_id,
      p_variant_id,
      'CZK',
      v_old_price,
      p_price,
      NULL,
      NULL,
      false,
      SQLERRM
    );
    
    RAISE EXCEPTION 'Error updating product variant price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get price history for a product variant
CREATE OR REPLACE FUNCTION get_price_history(
  p_product_id integer,
  p_variant_id text,
  p_limit integer DEFAULT 10
) RETURNS TABLE (
  operation_type text,
  old_price numeric,
  new_price numeric,
  success boolean,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pol.operation_type,
    pol.old_price,
    pol.new_price,
    pol.success,
    pol.created_at
  FROM price_operations_log pol
  WHERE pol.product_id = p_product_id
    AND pol.variant_id = p_variant_id
    AND pol.currency = 'CZK'
  ORDER BY pol.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically sync prices when updated
CREATE OR REPLACE FUNCTION trigger_sync_prices() RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger execution
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
    'trigger_sync_prices',
    NEW.product_id,
    NEW.variant_id,
    NEW.currency,
    NULL,
    NEW.custom_price,
    NEW.custom_price,
    (
      SELECT (value->>'price')::numeric
      FROM products p, jsonb_array_elements(p.variants) AS value
      WHERE p.id = NEW.product_id
        AND value->>'id' = NEW.variant_id
    ),
    true,
    NULL
  );
  
  -- If updating CZK price, also update the products table
  IF NEW.currency = 'CZK' AND NEW.is_active = true THEN
    -- Find the variant index
    DECLARE
      variant_index integer;
      variant_length integer;
      stock_status text;
      stripe_price_id text;
    BEGIN
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
        id = NEW.product_id AND
        value->>'id' = NEW.variant_id;
      
      -- Update the products table if variant found
      IF variant_index IS NOT NULL THEN
        UPDATE products
        SET 
          variants = jsonb_set(
            variants,
            ARRAY[variant_index::text],
            jsonb_build_object(
              'id', NEW.variant_id,
              'length', variant_length,
              'price', NEW.custom_price,
              'stockStatus', stock_status,
              'stripePriceId', stripe_price_id
            )
          ),
          updated_at = now()
        WHERE id = NEW.product_id;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log the error
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
          'trigger_sync_prices_error',
          NEW.product_id,
          NEW.variant_id,
          NEW.currency,
          NULL,
          NEW.custom_price,
          NEW.custom_price,
          NULL,
          false,
          SQLERRM
        );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_prices_trigger ON product_prices;
CREATE TRIGGER sync_prices_trigger
  AFTER INSERT OR UPDATE ON product_prices
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_prices();