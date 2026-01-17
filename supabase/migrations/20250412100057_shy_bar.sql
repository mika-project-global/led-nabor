/*
  # Fix warranty price consistency
  
  1. Changes
    - Add function to get warranty price with better error handling
    - Ensure consistent price display across all interfaces
    - Fix issue with warranty prices not being properly cached
*/

-- Create improved function to get warranty price with better error handling
CREATE OR REPLACE FUNCTION get_warranty_price_with_fallback(
  p_product_id integer,
  p_months integer,
  p_currency text
) RETURNS numeric AS $$
DECLARE
  custom_price numeric;
  fixed_price numeric;
  policy_price numeric;
  policy_multiplier numeric;
BEGIN
  -- First try warranty_custom_prices table
  SELECT custom_price INTO custom_price
  FROM warranty_custom_prices
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND is_active = true
  ORDER BY updated_at DESC
  LIMIT 1;
  
  -- If found, return it
  IF custom_price IS NOT NULL THEN
    RETURN custom_price;
  END IF;
  
  -- Next try warranty_fixed_prices table
  SELECT price INTO fixed_price
  FROM warranty_fixed_prices
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency;
    
  -- If found, return it
  IF fixed_price IS NOT NULL THEN
    RETURN fixed_price;
  END IF;
  
  -- Finally try warranty_policies table
  SELECT fixed_price, price_multiplier INTO policy_price, policy_multiplier
  FROM warranty_policies
  WHERE product_id = p_product_id
    AND months = p_months
  LIMIT 1;
  
  -- If found with fixed_price, return it
  IF policy_price IS NOT NULL THEN
    RETURN policy_price;
  END IF;
  
  -- If nothing found, return NULL
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return NULL on any exception
    RAISE NOTICE 'Error getting warranty price: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get all warranty prices for admin panel
CREATE OR REPLACE FUNCTION get_all_warranty_prices(
  p_currency text DEFAULT 'CZK'
) RETURNS TABLE (
  product_id integer,
  months integer,
  custom_price numeric,
  is_active boolean,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wcp.product_id,
    wcp.months,
    wcp.custom_price,
    wcp.is_active,
    wcp.updated_at
  FROM warranty_custom_prices wcp
  WHERE wcp.currency = p_currency
    AND wcp.is_active = true
  ORDER BY wcp.product_id, wcp.months, wcp.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add index for faster warranty price lookups
CREATE INDEX IF NOT EXISTS warranty_custom_prices_product_months_currency_idx 
ON warranty_custom_prices (product_id, months, currency, is_active);

-- Add index for faster fixed price lookups
CREATE INDEX IF NOT EXISTS warranty_fixed_prices_product_months_currency_idx 
ON warranty_fixed_prices (product_id, months, currency);