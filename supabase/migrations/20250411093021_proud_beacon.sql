/*
  # Fix warranty price display in different currencies
  
  1. Changes
    - Update fixed price for 5-meter RGB+CCT product warranty
    - Add function to return exact prices in requested currencies
    - Ensure consistent display across all interfaces
*/

-- Update fixed price for 5-meter RGB+CCT product warranty to exactly 800 CZK
UPDATE warranty_policies
SET fixed_price = 800
WHERE product_id = 1 AND months = 60;

-- Create a function to handle exact warranty pricing with hardcoded values
CREATE OR REPLACE FUNCTION get_exact_warranty_price(
  product_id integer,
  months integer,
  currency text
) RETURNS numeric AS $$
BEGIN
  -- For 5-meter RGB+CCT product with 60-month warranty (product_id = 1)
  IF product_id = 1 AND months = 60 THEN
    CASE currency
      WHEN 'EUR' THEN RETURN 32.00;
      WHEN 'GBP' THEN RETURN 28.00;
      WHEN 'PLN' THEN RETURN 140.00;
      WHEN 'UAH' THEN RETURN 1450.00;
      WHEN 'USD' THEN RETURN 35.00;
      WHEN 'CZK' THEN RETURN 800.00;
      ELSE RETURN 800.00;
    END CASE;
  END IF;
  
  -- For other products and warranty periods, return NULL to use standard calculation
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;