/*
  # Fix Security Issues

  ## Changes Made

  ### 1. Add Missing Indexes for Foreign Keys
  - `orders.user_id`
  - `payment_methods.user_id`
  - `payment_sessions.order_id`
  - `payment_sessions.user_id`
  - `warranty_history.order_id`
  - `warranty_registrations.warranty_policy_id`

  ### 2. Optimize RLS Policies (Replace auth.uid() with (select auth.uid()))
  - payment_sessions policies (v4 and v5)
  - payment_methods policies
  - profiles policies

  ### 3. Remove Duplicate Policies
  - Drop old v4 payment_sessions policies, keep optimized versions
  - Remove duplicate products policies

  ### 4. Drop Unused Indexes
  - payment_transactions indexes
  - product_prices indexes
  - stripe_events indexes
  - warranty_custom_prices indexes
  - warranty_fixed_prices indexes
  - warranty_registrations indexes

  ### 5. Fix Function Search Paths
  - Add SET search_path = '' to all public functions

  Note: Auth OTP expiry and Leaked Password Protection must be configured in Supabase Dashboard under Authentication > Providers.
*/

-- =====================================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- =====================================================

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS payment_sessions_order_id_idx ON public.payment_sessions(order_id);
CREATE INDEX IF NOT EXISTS payment_sessions_user_id_idx ON public.payment_sessions(user_id);
CREATE INDEX IF NOT EXISTS warranty_history_order_id_idx ON public.warranty_history(order_id);
CREATE INDEX IF NOT EXISTS warranty_registrations_warranty_policy_id_idx ON public.warranty_registrations(warranty_policy_id);

-- =====================================================
-- 2. DROP DUPLICATE POLICIES (Keep v5, remove v4)
-- =====================================================

DROP POLICY IF EXISTS "Public can create payment sessions v4" ON public.payment_sessions;
DROP POLICY IF EXISTS "Public can read payment sessions v4" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can create payment sessions for their orders v4" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can view payment sessions for their orders v4" ON public.payment_sessions;

-- Drop overlapping products policy
DROP POLICY IF EXISTS "Authenticated users can manage products" ON public.products;

-- =====================================================
-- 3. RECREATE RLS POLICIES WITH OPTIMIZED auth.uid()
-- =====================================================

-- payment_sessions policies (v5 optimized)
DROP POLICY IF EXISTS "Public can create payment sessions v5" ON public.payment_sessions;
DROP POLICY IF EXISTS "Public can read payment sessions v5" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can create payment sessions for their orders v5" ON public.payment_sessions;
DROP POLICY IF EXISTS "Users can view payment sessions for their orders v5" ON public.payment_sessions;

CREATE POLICY "Public can create payment sessions"
  ON public.payment_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can read payment sessions"
  ON public.payment_sessions
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can create payment sessions"
  ON public.payment_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payment_sessions.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can view payment sessions"
  ON public.payment_sessions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payment_sessions.order_id
      AND orders.user_id = (select auth.uid())
    )
  );

-- payment_methods policies
DROP POLICY IF EXISTS "Users can create their own payment methods" ON public.payment_methods;
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;

CREATE POLICY "Users can create their own payment methods"
  ON public.payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- profiles policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

-- =====================================================
-- 4. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS public.payment_transactions_order_id_idx;
DROP INDEX IF EXISTS public.payment_transactions_payment_intent_idx;
DROP INDEX IF EXISTS public.product_prices_lookup_idx;
DROP INDEX IF EXISTS public.product_prices_product_variant_idx;
DROP INDEX IF EXISTS public.product_prices_updated_idx;
DROP INDEX IF EXISTS public.stripe_events_processed_idx;
DROP INDEX IF EXISTS public.stripe_events_type_idx;
DROP INDEX IF EXISTS public.warranty_custom_prices_lookup_idx;
DROP INDEX IF EXISTS public.warranty_custom_prices_product_months_currency_idx;
DROP INDEX IF EXISTS public.warranty_custom_prices_product_months_idx;
DROP INDEX IF EXISTS public.warranty_custom_prices_product_variant_months_currency_idx;
DROP INDEX IF EXISTS public.warranty_custom_prices_product_variant_months_idx;
DROP INDEX IF EXISTS public.warranty_fixed_prices_product_months_currency_idx;
DROP INDEX IF EXISTS public.warranty_prices_updated_idx;
DROP INDEX IF EXISTS public.warranty_registrations_customer_email_idx;
DROP INDEX IF EXISTS public.warranty_registrations_order_id_idx;

-- =====================================================
-- 5. FIX FUNCTION SEARCH PATHS
-- =====================================================

ALTER FUNCTION public.debug_product_price(integer, text, text) SET search_path = '';
ALTER FUNCTION public.debug_warranty_price(integer, integer, text, text) SET search_path = '';
ALTER FUNCTION public.fix_all_product_prices() SET search_path = '';
ALTER FUNCTION public.fix_all_warranty_prices() SET search_path = '';
ALTER FUNCTION public.get_all_active_prices(text) SET search_path = '';
ALTER FUNCTION public.get_all_product_prices(text) SET search_path = '';
ALTER FUNCTION public.get_all_warranty_prices(text) SET search_path = '';
ALTER FUNCTION public.get_database_size() SET search_path = '';
ALTER FUNCTION public.get_latest_product_price(integer, text, text) SET search_path = '';
ALTER FUNCTION public.get_latest_warranty_price(integer, integer, text) SET search_path = '';
ALTER FUNCTION public.get_price_history(integer, text, integer) SET search_path = '';
ALTER FUNCTION public.get_price_history(integer, text, text, integer) SET search_path = '';
ALTER FUNCTION public.get_product_custom_price(integer, text, text) SET search_path = '';
ALTER FUNCTION public.get_product_price(integer, text, text) SET search_path = '';
ALTER FUNCTION public.get_product_prices(text) SET search_path = '';
ALTER FUNCTION public.get_storage_size() SET search_path = '';
ALTER FUNCTION public.get_total_build_minutes() SET search_path = '';
ALTER FUNCTION public.get_warranty_custom_price(integer, integer, text) SET search_path = '';
ALTER FUNCTION public.get_warranty_price(integer, integer, text) SET search_path = '';
ALTER FUNCTION public.get_warranty_price(integer, integer, text, text) SET search_path = '';
ALTER FUNCTION public.get_warranty_price_for_variant(integer, integer, text, text) SET search_path = '';
ALTER FUNCTION public.get_warranty_price_in_currency(numeric, text) SET search_path = '';
ALTER FUNCTION public.get_warranty_prices_for_product(integer, text) SET search_path = '';
ALTER FUNCTION public.get_warranty_prices_with_variant(text, text) SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.handle_new_warranty_price(integer, integer, text, numeric) SET search_path = '';
ALTER FUNCTION public.handle_updated_at() SET search_path = '';
ALTER FUNCTION public.handle_warranty_updated_at() SET search_path = '';
ALTER FUNCTION public.random_date_last_3months() SET search_path = '';
ALTER FUNCTION public.random_date_since_2012() SET search_path = '';
ALTER FUNCTION public.sync_all_prices() SET search_path = '';
ALTER FUNCTION public.sync_prices_between_tables() SET search_path = '';
ALTER FUNCTION public.sync_warranty_prices() SET search_path = '';
ALTER FUNCTION public.trigger_sync_prices() SET search_path = '';
ALTER FUNCTION public.update_price_timestamp() SET search_path = '';
ALTER FUNCTION public.update_product_price(uuid, numeric) SET search_path = '';
ALTER FUNCTION public.update_product_price_direct(integer, text, text, numeric) SET search_path = '';
ALTER FUNCTION public.update_product_variant_price(integer, text, numeric) SET search_path = '';
ALTER FUNCTION public.update_product_variant_price_with_stripe(integer, text, numeric, text) SET search_path = '';
ALTER FUNCTION public.update_warranty_price(uuid, numeric) SET search_path = '';
ALTER FUNCTION public.update_warranty_price_direct(integer, integer, text, numeric) SET search_path = '';
ALTER FUNCTION public.update_warranty_price_direct(integer, integer, text, numeric, text) SET search_path = '';
ALTER FUNCTION public.update_warranty_price_with_variant(integer, integer, text, numeric, text) SET search_path = '';
ALTER FUNCTION public.update_warranty_price_with_variants(integer, integer, text, numeric) SET search_path = '';
ALTER FUNCTION public.update_warranty_price_with_variants(integer, integer, text, numeric, text) SET search_path = '';
ALTER FUNCTION public.verify_price_update(integer, text, numeric) SET search_path = '';
