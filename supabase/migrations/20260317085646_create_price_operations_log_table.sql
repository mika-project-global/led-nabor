/*
  # Create price_operations_log table

  Required by trigger_sync_prices trigger on product_prices table.
*/

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
  success boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE price_operations_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'price_operations_log' AND policyname = 'Admins can read price operations log'
  ) THEN
    CREATE POLICY "Admins can read price operations log"
      ON price_operations_log FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;
