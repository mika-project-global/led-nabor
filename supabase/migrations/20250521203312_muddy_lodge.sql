/*
  # Fix RGB+CCT Stripe Price IDs
  
  1. Changes
    - Update RGB+CCT product variants with correct Stripe price IDs
    - Ensure all variants work correctly with Stripe checkout
    
  2. Security
    - No changes to RLS policies
*/

-- Update the RGB+CCT product variants with correct Stripe price IDs
UPDATE products
SET variants = jsonb_build_array(
  jsonb_build_object(
    'id', 'rgb-5',
    'length', 5,
    'price', 5350,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RBavEKVsLiX4gAoLBIsBRBo'
  ),
  jsonb_build_object(
    'id', 'rgb-10',
    'length', 10,
    'price', 9850,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RQvQaKVsLiX4gAoAM9jFgQF'
  ),
  jsonb_build_object(
    'id', 'rgb-15',
    'length', 15,
    'price', 14350,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RQvT0KVsLiX4gAo82B7RMv1'
  ),
  jsonb_build_object(
    'id', 'rgb-20',
    'length', 20,
    'price', 18850,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RQvUCKVsLiX4gAoKB4CQoke'
  ),
  jsonb_build_object(
    'id', 'rgb-25',
    'length', 25,
    'price', 23350,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RQvVhKVsLiX4gAosGqmcogz'
  ),
  jsonb_build_object(
    'id', 'rgb-30',
    'length', 30,
    'price', 27850,
    'stockStatus', 'in_stock',
    'stripePriceId', 'price_1RQvX5KVsLiX4gAovDOklpwo'
  )
)
WHERE id = 1;

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
)
VALUES
  ('update_stripe_price_ids', 1, 'rgb-10', 'CZK', 9850, 9850, 9850, 9850, true, NULL),
  ('update_stripe_price_ids', 1, 'rgb-15', 'CZK', 14350, 14350, 14350, 14350, true, NULL),
  ('update_stripe_price_ids', 1, 'rgb-20', 'CZK', 18850, 18850, 18850, 18850, true, NULL),
  ('update_stripe_price_ids', 1, 'rgb-25', 'CZK', 23350, 23350, 23350, 23350, true, NULL),
  ('update_stripe_price_ids', 1, 'rgb-30', 'CZK', 27850, 27850, 27850, 27850, true, NULL);

-- Force a timestamp update to ensure the changes are picked up
UPDATE products
SET updated_at = now()
WHERE id = 1;