/*
  # Add warranty price update function with variants

  1. Changes
    - Create new function `update_warranty_price_with_variants` that handles variant-specific warranty prices
    - Function parameters:
      - p_product_id: Product ID
      - p_months: Warranty duration in months
      - p_currency: Price currency
      - p_price: Price amount
      - p_variant_id: Product variant ID
    - Returns: boolean indicating success

  2. Security
    - Function is accessible to all authenticated users
*/

CREATE OR REPLACE FUNCTION public.update_warranty_price_with_variants(
  p_product_id integer,
  p_months integer,
  p_currency text,
  p_price numeric,
  p_variant_id text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_id uuid;
BEGIN
  -- Check if there's an existing active price for this combination
  SELECT id INTO v_existing_id
  FROM warranty_custom_prices
  WHERE product_id = p_product_id
    AND months = p_months
    AND currency = p_currency
    AND variant_id = p_variant_id
    AND is_active = true;

  -- If exists, deactivate it
  IF v_existing_id IS NOT NULL THEN
    UPDATE warranty_custom_prices
    SET is_active = false
    WHERE id = v_existing_id;
  END IF;

  -- Insert new price
  INSERT INTO warranty_custom_prices (
    product_id,
    months,
    currency,
    custom_price,
    variant_id,
    is_active
  ) VALUES (
    p_product_id,
    p_months,
    p_currency,
    p_price,
    p_variant_id,
    true
  );

  RETURN true;
END;
$$;