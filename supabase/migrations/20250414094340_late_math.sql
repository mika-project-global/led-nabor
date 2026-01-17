/*
  # Fix price system errors
  
  1. Changes
    - Fix issues with product_prices and warranty_custom_prices tables
    - Ensure proper synchronization between tables
    - Fix RPC functions for price management
    - Add proper error handling
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE TABLE products (
      id integer PRIMARY KEY,
      name text NOT NULL,
      variants jsonb NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    
    -- Insert default products
    INSERT INTO products (id, name, variants)
    VALUES 
      (1, 'Универсальный RGB+CCT набор', '[
        {"id": "rgb-5", "length": 5, "price": 5350, "stockStatus": "in_stock"},
        {"id": "rgb-10", "length": 10, "price": 28000, "stockStatus": "in_stock"},
        {"id": "rgb-15", "length": 15, "price": 40000, "stockStatus": "in_stock"},
        {"id": "rgb-20", "length": 20, "price": 52000, "stockStatus": "in_stock"},
        {"id": "rgb-25", "length": 25, "price": 65000, "stockStatus": "in_stock"},
        {"id": "rgb-30", "length": 30, "price": 78000, "stockStatus": "in_stock"}
      ]'::jsonb),
      (2, 'Белая CCT подсветка', '[
        {"id": "cct-5", "length": 5, "price": 12000, "stockStatus": "in_stock"},
        {"id": "cct-10", "length": 10, "price": 22000, "stockStatus": "in_stock"},
        {"id": "cct-15", "length": 15, "price": 32000, "stockStatus": "in_stock"},
        {"id": "cct-20", "length": 20, "price": 42000, "stockStatus": "in_stock"},
        {"id": "cct-25", "length": 25, "price": 52000, "stockStatus": "in_stock"},
        {"id": "cct-30", "length": 30, "price": 62000, "stockStatus": "in_stock"}
      ]'::jsonb);
      
    -- Enable RLS
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Public can read products"
      ON products
      FOR SELECT
      TO public
      USING (true);
      
    CREATE POLICY "Authenticated users can manage products"
      ON products
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
      
    -- Create updated_at trigger
    CREATE TRIGGER handle_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION handle_updated_at();
  END IF;
END $$;

-- Sync products table with product_prices
DO $$
DECLARE
  product RECORD;
  variant RECORD;
BEGIN
  -- For each product
  FOR product IN SELECT * FROM products
  LOOP
    -- For each variant
    FOR variant IN SELECT * FROM jsonb_to_recordset(product.variants) AS x(id text, length integer, price numeric, stockStatus text)
    LOOP
      -- Check if price exists in product_prices
      IF NOT EXISTS (
        SELECT 1 
        FROM product_prices 
        WHERE product_id = product.id 
          AND variant_id = variant.id 
          AND currency = 'CZK'
          AND is_active = true
      ) THEN
        -- Insert price
        INSERT INTO product_prices (
          product_id,
          variant_id,
          currency,
          custom_price,
          is_active
        ) VALUES (
          product.id,
          variant.id,
          'CZK',
          variant.price,
          true
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

-- Fix get_product_prices function
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
  
  -- If no results, sync from products table
  IF NOT FOUND THEN
    -- Insert prices from products table
    INSERT INTO product_prices (
      product_id,
      variant_id,
      currency,
      custom_price,
      is_active
    )
    SELECT 
      p.id,
      (v->>'id')::text,
      'CZK',
      (v->>'price')::numeric,
      true
    FROM 
      products p,
      jsonb_array_elements(p.variants) AS v
    WHERE 
      NOT EXISTS (
        SELECT 1 
        FROM product_prices pp 
        WHERE 
          pp.product_id = p.id AND 
          pp.variant_id = (v->>'id')::text AND 
          pp.currency = 'CZK' AND
          pp.is_active = true
      );
    
    -- Return the newly inserted prices
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
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix update_product_price_direct function
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
  
  -- If updating CZK price, also update the products table
  IF p_currency = 'CZK' THEN
    -- Find the variant index and length
    SELECT 
      (ordinality - 1)::integer,
      (value->>'length')::integer
    INTO 
      variant_index,
      variant_length
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
            'stockStatus', 'in_stock'
          )
        ),
        updated_at = now()
      WHERE id = p_product_id;
    END IF;
  END IF;
  
  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating product price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix get_warranty_prices function
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
    wcp.id,
    wcp.product_id,
    wcp.months,
    wcp.currency,
    wcp.custom_price,
    wcp.is_active,
    wcp.updated_at
  FROM warranty_custom_prices wcp
  WHERE wcp.currency = p_currency
    AND wcp.is_active = true
    AND wcp.variant_id = 'rgb-5'
  ORDER BY wcp.product_id, wcp.months;
  
  -- If no results, try to sync from warranty_policies
  IF NOT FOUND THEN
    -- Insert default warranty prices from policies
    INSERT INTO warranty_custom_prices (
      product_id,
      variant_id,
      months,
      currency,
      custom_price,
      is_active
    )
    SELECT 
      wp.product_id,
      'rgb-5',
      wp.months,
      'CZK',
      COALESCE(wp.fixed_price, 0),
      true
    FROM 
      warranty_policies wp
    WHERE 
      wp.fixed_price IS NOT NULL
    ON CONFLICT DO NOTHING;
    
    -- Return the newly inserted prices
    RETURN QUERY
    SELECT 
      wcp.id,
      wcp.product_id,
      wcp.months,
      wcp.currency,
      wcp.custom_price,
      wcp.is_active,
      wcp.updated_at
    FROM warranty_custom_prices wcp
    WHERE wcp.currency = p_currency
      AND wcp.is_active = true
      AND wcp.variant_id = 'rgb-5'
    ORDER BY wcp.product_id, wcp.months;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix update_warranty_price_direct function
CREATE OR REPLACE FUNCTION update_warranty_price_direct(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric
) RETURNS numeric AS $$
DECLARE
  new_price numeric;
  variant_length integer;
  base_length integer := 5;
  calculated_price numeric;
  v_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
BEGIN
  -- First update the base price for rgb-5
  UPDATE warranty_custom_prices
  SET is_active = false
  WHERE product_id = p_product_id
    AND variant_id = 'rgb-5'
    AND months = p_months
    AND currency = p_currency
    AND is_active = true;
    
  INSERT INTO warranty_custom_prices (
    product_id,
    variant_id,
    months,
    currency,
    custom_price,
    is_active,
    updated_at
  ) VALUES (
    p_product_id,
    'rgb-5',
    p_months,
    p_currency,
    p_price,
    true,
    clock_timestamp()
  )
  RETURNING custom_price INTO new_price;
  
  -- Update warranty_policies table if applicable
  IF p_currency = 'CZK' THEN
    UPDATE warranty_policies
    SET fixed_price = p_price
    WHERE product_id = p_product_id
      AND months = p_months;
  END IF;
  
  -- Update warranty_fixed_prices table
  INSERT INTO warranty_fixed_prices (
    product_id,
    months,
    currency,
    price
  ) VALUES (
    p_product_id,
    p_months,
    p_currency,
    p_price
  )
  ON CONFLICT (product_id, months, currency) 
  DO UPDATE SET price = EXCLUDED.price;
  
  -- Now update all other variants
  FOREACH v_id IN ARRAY variants
  LOOP
    -- Skip rgb-5 as we already updated it
    IF v_id != 'rgb-5' THEN
      -- Extract length from variant ID
      CASE 
        WHEN v_id = 'rgb-10' THEN variant_length := 10;
        WHEN v_id = 'rgb-15' THEN variant_length := 15;
        WHEN v_id = 'rgb-20' THEN variant_length := 20;
        WHEN v_id = 'rgb-25' THEN variant_length := 25;
        WHEN v_id = 'rgb-30' THEN variant_length := 30;
        ELSE variant_length := 5;
      END CASE;
      
      -- Simple multiplication based on length ratio
      calculated_price := p_price * (variant_length / base_length);
      calculated_price := round(calculated_price);
      
      -- Update price for this variant
      UPDATE warranty_custom_prices
      SET is_active = false
      WHERE product_id = p_product_id
        AND variant_id = v_id
        AND months = p_months
        AND currency = p_currency
        AND is_active = true;
        
      INSERT INTO warranty_custom_prices (
        product_id,
        variant_id,
        months,
        currency,
        custom_price,
        is_active,
        updated_at
      ) VALUES (
        p_product_id,
        v_id,
        p_months,
        p_currency,
        calculated_price,
        true,
        clock_timestamp()
      );
    END IF;
  END LOOP;

  RETURN new_price;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error updating warranty price: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to sync all prices between tables
CREATE OR REPLACE FUNCTION sync_all_prices() RETURNS void AS $$
BEGIN
  -- Sync product prices from products table to product_prices
  INSERT INTO product_prices (
    product_id,
    variant_id,
    currency,
    custom_price,
    is_active
  )
  SELECT 
    p.id,
    (v->>'id')::text,
    'CZK',
    (v->>'price')::numeric,
    true
  FROM 
    products p,
    jsonb_array_elements(p.variants) AS v
  WHERE 
    NOT EXISTS (
      SELECT 1 
      FROM product_prices pp 
      WHERE 
        pp.product_id = p.id AND 
        pp.variant_id = (v->>'id')::text AND 
        pp.currency = 'CZK' AND
        pp.is_active = true
    )
  ON CONFLICT DO NOTHING;
  
  -- Sync warranty prices from warranty_policies to warranty_custom_prices
  INSERT INTO warranty_custom_prices (
    product_id,
    variant_id,
    months,
    currency,
    custom_price,
    is_active
  )
  SELECT 
    wp.product_id,
    'rgb-5',
    wp.months,
    'CZK',
    COALESCE(wp.fixed_price, 0),
    true
  FROM 
    warranty_policies wp
  WHERE 
    wp.fixed_price IS NOT NULL AND
    NOT EXISTS (
      SELECT 1 
      FROM warranty_custom_prices wcp 
      WHERE 
        wcp.product_id = wp.product_id AND 
        wcp.variant_id = 'rgb-5' AND
        wcp.months = wp.months AND 
        wcp.currency = 'CZK' AND
        wcp.is_active = true
    )
  ON CONFLICT DO NOTHING;
  
  -- Sync from warranty_custom_prices to warranty_fixed_prices
  INSERT INTO warranty_fixed_prices (
    product_id,
    months,
    currency,
    price
  )
  SELECT 
    wcp.product_id,
    wcp.months,
    wcp.currency,
    wcp.custom_price
  FROM 
    warranty_custom_prices wcp
  WHERE 
    wcp.is_active = true AND
    wcp.variant_id = 'rgb-5' AND
    NOT EXISTS (
      SELECT 1 
      FROM warranty_fixed_prices wfp 
      WHERE 
        wfp.product_id = wcp.product_id AND 
        wfp.months = wcp.months AND 
        wfp.currency = wcp.currency
    )
  ON CONFLICT (product_id, months, currency) 
  DO UPDATE SET price = EXCLUDED.price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the sync function to ensure all prices are properly synchronized
SELECT sync_all_prices();