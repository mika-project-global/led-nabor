/*
  # Comprehensive Price Synchronization System
  
  1. Changes
    - Create improved price synchronization trigger
    - Add detailed logging for price operations
    - Ensure consistent price display across all interfaces
    - Fix variant-specific pricing issues
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create a price operations log table
CREATE TABLE IF NOT EXISTS price_operations_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL,
  product_id integer NOT NULL,
  variant_id text NOT NULL,
  currency text NOT NULL,
  old_price numeric,
  new_price numeric NOT NULL,
  admin_panel_price numeric,
  website_price numeric,
  success boolean NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE price_operations_log ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can read price operations log"
  ON price_operations_log
  FOR SELECT
  TO public
  USING (true);

-- Create enhanced function to update product price with proper synchronization and logging
CREATE OR REPLACE FUNCTION update_product_price_direct(
  p_product_id integer,
  p_variant_id text,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  old_price numeric;
  variant_index integer;
  variant_length integer;
  stock_status text;
  stripe_price_id text;
  website_price numeric;
  success boolean := true;
  error_message text := null;
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
    ELSE
      success := false;
      error_message := 'Variant not found in products table';
    END IF;
  END IF;
  
  -- Verify the update was successful
  IF p_currency = 'CZK' THEN
    -- Get price from products table (website)
    SELECT (value->>'price')::numeric INTO website_price
    FROM products p, jsonb_array_elements(p.variants) AS value
    WHERE p.id = p_product_id
      AND value->>'id' = p_variant_id;
      
    IF website_price != p_price THEN
      success := false;
      error_message := format('Price verification failed: website_price=%s, expected=%s', website_price, p_price);
    END IF;
  END IF;
  
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
    'update_price',
    p_product_id,
    p_variant_id,
    p_currency,
    old_price,
    p_price,
    new_price,
    website_price,
    success,
    error_message
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
      'update_price',
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

-- Create an enhanced function to synchronize prices between tables with logging
CREATE OR REPLACE FUNCTION sync_prices_between_tables() RETURNS void AS $$
DECLARE
  product RECORD;
  variant RECORD;
  admin_price numeric;
  website_price numeric;
  sync_count integer := 0;
BEGIN
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
        -- Update the products table
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
        
        -- Log the sync operation
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
          'sync_price',
          product.id,
          variant.id,
          'CZK',
          website_price,
          admin_price,
          admin_price,
          website_price,
          true,
          NULL
        );
        
        sync_count := sync_count + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Log the overall sync operation
  IF sync_count > 0 THEN
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
      'sync_summary',
      0,
      '',
      '',
      NULL,
      NULL,
      NULL,
      NULL,
      true,
      format('Synchronized %s prices', sync_count)
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create an enhanced trigger to automatically sync prices when updated
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

-- Create a function to get the price history for a product variant
CREATE OR REPLACE FUNCTION get_price_history(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK',
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
    AND pol.currency = p_currency
  ORDER BY pol.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function to ensure all prices are properly synchronized
SELECT sync_prices_between_tables();