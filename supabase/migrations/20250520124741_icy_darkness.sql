/*
  # Update RGB+CCT product prices
  
  1. Changes
    - Update prices for all RGB+CCT product variants
    - 5 meters: 5,350 CZK
    - 10 meters: 9,850 CZK
    - 15 meters: 14,350 CZK
    - 20 meters: 18,850 CZK
    - 25 meters: 23,350 CZK
    - 30 meters: 27,850 CZK
    
  2. Tables Updated
    - product_prices (for admin panel)
    - products (for website frontend)
*/

-- Update the RGB+CCT product prices
DO $$
DECLARE
  v_variant_id text;
  v_price numeric;
  v_variant_index integer;
  v_stripe_price_id text;
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
    -- Update product_prices table (for admin panel)
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
    
    -- Get the variant index and Stripe price ID for products table update
    SELECT 
      (ordinality - 1)::integer,
      value->>'stripePriceId'
    INTO 
      v_variant_index,
      v_stripe_price_id
    FROM 
      products,
      jsonb_array_elements(variants) WITH ORDINALITY
    WHERE 
      id = 1 AND
      value->>'id' = v_variant_id;
    
    -- Update products table (for website frontend)
    IF v_variant_index IS NOT NULL THEN
      UPDATE products
      SET variants = jsonb_set(
        variants,
        ARRAY[v_variant_index::text],
        jsonb_build_object(
          'id', v_variant_id,
          'length', CASE 
            WHEN v_variant_id = 'rgb-5' THEN 5
            WHEN v_variant_id = 'rgb-10' THEN 10
            WHEN v_variant_id = 'rgb-15' THEN 15
            WHEN v_variant_id = 'rgb-20' THEN 20
            WHEN v_variant_id = 'rgb-25' THEN 25
            WHEN v_variant_id = 'rgb-30' THEN 30
            ELSE 5
          END,
          'price', v_price,
          'stockStatus', 'in_stock',
          'stripePriceId', v_stripe_price_id
        )
      )
      WHERE id = 1;
    END IF;
    
    RAISE NOTICE 'Updated price for variant % to %', v_variant_id, v_price;
  END LOOP;
  
  RAISE NOTICE 'Updated RGB+CCT product prices according to the new pricing structure';
END $$;

-- Log the final prices for verification
DO $$
DECLARE
  v_variant_id text;
  variants text[] := ARRAY['rgb-5', 'rgb-10', 'rgb-15', 'rgb-20', 'rgb-25', 'rgb-30'];
  admin_price numeric;
  website_price numeric;
BEGIN
  RAISE NOTICE 'Final price verification:';
  
  FOREACH v_variant_id IN ARRAY variants
  LOOP
    -- Get price from product_prices (admin panel)
    SELECT pp.custom_price INTO admin_price
    FROM product_prices pp
    WHERE pp.product_id = 1
      AND pp.variant_id = v_variant_id
      AND pp.currency = 'CZK'
      AND pp.is_active = true
    ORDER BY pp.updated_at DESC
    LIMIT 1;
    
    -- Get price from products table (website)
    SELECT (value->>'price')::numeric INTO website_price
    FROM products p, jsonb_array_elements(p.variants) AS value
    WHERE p.id = 1
      AND value->>'id' = v_variant_id;
    
    RAISE NOTICE 'Variant: %, Admin price: %, Website price: %', v_variant_id, admin_price, website_price;
  END LOOP;
END $$;