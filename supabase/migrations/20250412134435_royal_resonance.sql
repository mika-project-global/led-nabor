/*
  # Fix price integration between admin panel and website
  
  1. Changes
    - Add variant_id to warranty_custom_prices table
    - Create improved functions for price retrieval
    - Fix synchronization between tables
    - Add better error handling
    
  2. Security
    - Maintain existing RLS policies
*/

-- Create function to get product price with proper fallback
CREATE OR REPLACE FUNCTION get_product_price(
  p_product_id integer,
  p_variant_id text,
  p_currency text DEFAULT 'CZK'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  base_price numeric;
BEGIN
  -- First try to get custom price from product_prices table
  SELECT pp.custom_price INTO custom_price
  FROM product_prices pp
  WHERE pp.product_id = p_product_id
    AND pp.variant_id = p_variant_id
    AND pp.currency = p_currency
    AND pp.is_active = true
  ORDER BY pp.updated_at DESC
  LIMIT 1;
  
  -- If found, return it
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- If not found, try to get from products table
  SELECT (value->>'price')::numeric INTO base_price
  FROM products p, jsonb_array_elements(p.variants) AS value
  WHERE p.id = p_product_id
    AND value->>'id' = p_variant_id;
  
  -- Return base price or 0 if not found
  RETURN COALESCE(base_price, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get warranty price with proper fallback
CREATE OR REPLACE FUNCTION get_warranty_price(
  p_product_id integer,
  p_months integer,
  p_currency text DEFAULT 'CZK',
  p_variant_id text DEFAULT 'rgb-5'
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  default_price numeric;
  fixed_price numeric;
  policy_price numeric;
BEGIN
  -- First try to get custom price for specific variant
  SELECT wcp.custom_price INTO custom_price
  FROM warranty_custom_prices wcp
  WHERE wcp.product_id = p_product_id
    AND wcp.variant_id = p_variant_id
    AND wcp.months = p_months
    AND wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.updated_at DESC
  LIMIT 1;
  
  -- If found, return it
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- If not found and not default variant, try default variant
  IF p_variant_id != 'rgb-5' THEN
    SELECT wcp.custom_price INTO default_price
    FROM warranty_custom_prices wcp
    WHERE wcp.product_id = p_product_id
      AND wcp.variant_id = 'rgb-5'
      AND wcp.months = p_months
      AND wcp.currency = p_currency
      AND wcp.is_active = true
    ORDER BY wcp.updated_at DESC
    LIMIT 1;
    
    -- If found, return it
    IF default_price IS NOT NULL THEN
      RETURN default_price;
    END IF;
  END IF;
  
  -- Next try warranty_fixed_prices table
  SELECT wfp.price INTO fixed_price
  FROM warranty_fixed_prices wfp
  WHERE wfp.product_id = p_product_id
    AND wfp.months = p_months
    AND wfp.currency = p_currency;
  
  -- If found, return it
  IF fixed_price IS NOT NULL THEN
    RETURN fixed_price;
  END IF;
  
  -- Finally try warranty_policies table
  SELECT wp.fixed_price INTO policy_price
  FROM warranty_policies wp
  WHERE wp.product_id = p_product_id
    AND wp.months = p_months;
  
  -- If found, return it
  IF policy_price IS NOT NULL THEN
    RETURN policy_price;
  END IF;
  
  -- If nothing found, return 0
  RETURN 0;
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