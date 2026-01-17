/*
  # Fix price synchronization

  1. Changes
    - Add trigger to sync prices between tables
    - Ensure price updates are properly propagated

  2. Security
    - No changes to RLS policies
*/

CREATE OR REPLACE FUNCTION public.trigger_sync_prices()
RETURNS TRIGGER AS $$
BEGIN
  -- Update timestamp when prices are modified
  UPDATE product_prices
  SET updated_at = CURRENT_TIMESTAMP
  WHERE product_id = NEW.product_id
    AND variant_id = NEW.variant_id
    AND currency = NEW.currency;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'sync_prices_trigger'
  ) THEN
    CREATE TRIGGER sync_prices_trigger
    AFTER INSERT OR UPDATE ON product_prices
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_sync_prices();
  END IF;
END $$;