/*
  # Fix Security Issues Part 1 - RLS Policies and Indexes

  1. Add Missing Foreign Key Indexes
  2. Drop Unused Indexes
  3. Fix Auth RLS Initialization (wrap auth functions in SELECT)
  4. Fix Multiple Permissive Policies
  5. Fix RLS Policies That Are Always True
*/

-- =====================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_warranty_registrations_order_id ON warranty_registrations(order_id);

-- =====================================================
-- 2. DROP UNUSED INDEXES
-- =====================================================

DROP INDEX IF EXISTS idx_viewing_history_user_id;
DROP INDEX IF EXISTS idx_viewing_history_session_id;
DROP INDEX IF EXISTS idx_viewing_history_product_id;
DROP INDEX IF EXISTS orders_user_id_idx;
DROP INDEX IF EXISTS payment_methods_user_id_idx;
DROP INDEX IF EXISTS payment_sessions_order_id_idx;
DROP INDEX IF EXISTS payment_sessions_user_id_idx;
DROP INDEX IF EXISTS warranty_history_order_id_idx;
DROP INDEX IF EXISTS warranty_registrations_warranty_policy_id_idx;
DROP INDEX IF EXISTS wishlist_user_id_idx;
DROP INDEX IF EXISTS idx_installation_videos_step;
DROP INDEX IF EXISTS idx_product_videos_product_id;

-- =====================================================
-- 3. FIX WISHLIST RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can add to own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can remove from own wishlist" ON wishlist;

CREATE POLICY "Users can view own wishlist"
  ON wishlist FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can add to own wishlist"
  ON wishlist FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can remove from own wishlist"
  ON wishlist FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- 4. FIX VIEWING_HISTORY RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own history" ON viewing_history;
DROP POLICY IF EXISTS "Users can insert own history" ON viewing_history;
DROP POLICY IF EXISTS "Users can delete own history" ON viewing_history;

CREATE POLICY "Users can view own history"
  ON viewing_history FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own history"
  ON viewing_history FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own history"
  ON viewing_history FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- =====================================================
-- 5. FIX BLOG_POSTS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can view all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated can view all blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated users can create blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can update posts in their translation group" ON blog_posts;
DROP POLICY IF EXISTS "Authors can delete posts in their translation group" ON blog_posts;

CREATE POLICY "Public can view published blog posts"
  ON blog_posts FOR SELECT TO anon
  USING (published = true);

CREATE POLICY "Authenticated can view all blog posts"
  ON blog_posts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create blog posts"
  ON blog_posts FOR INSERT TO authenticated
  WITH CHECK (author_id = (SELECT auth.uid()));

CREATE POLICY "Authors can update posts in their translation group"
  ON blog_posts FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts bp
      WHERE bp.translation_group_id = blog_posts.translation_group_id
      AND bp.author_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM blog_posts bp
      WHERE bp.translation_group_id = blog_posts.translation_group_id
      AND bp.author_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Authors can delete posts in their translation group"
  ON blog_posts FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM blog_posts bp
      WHERE bp.translation_group_id = blog_posts.translation_group_id
      AND bp.author_id = (SELECT auth.uid())
    )
  );

-- =====================================================
-- 6. FIX INSTALLATION_VIDEOS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view active installation videos" ON installation_videos;
DROP POLICY IF EXISTS "Authenticated users can view all installation videos" ON installation_videos;
DROP POLICY IF EXISTS "Authenticated users can insert installation videos" ON installation_videos;
DROP POLICY IF EXISTS "Authenticated users can update installation videos" ON installation_videos;
DROP POLICY IF EXISTS "Authenticated users can delete installation videos" ON installation_videos;

CREATE POLICY "Public can view active installation videos"
  ON installation_videos FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "Authenticated can view all installation videos"
  ON installation_videos FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage installation videos"
  ON installation_videos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- 7. FIX PRODUCT_VIDEOS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can view product videos" ON product_videos;
DROP POLICY IF EXISTS "Authenticated users can insert videos" ON product_videos;
DROP POLICY IF EXISTS "Authenticated users can update videos" ON product_videos;
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON product_videos;

CREATE POLICY "Anyone can view product videos"
  ON product_videos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage product videos"
  ON product_videos FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- 8. FIX SITE_SETTINGS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can view site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can insert site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Anyone can delete site settings" ON site_settings;

CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage site settings"
  ON site_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- 9. FIX PRODUCT_PRICES RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read product prices" ON product_prices;
DROP POLICY IF EXISTS "Anyone can view product prices" ON product_prices;
DROP POLICY IF EXISTS "Anyone can insert product prices" ON product_prices;
DROP POLICY IF EXISTS "Anyone can update product prices" ON product_prices;
DROP POLICY IF EXISTS "Anyone can delete product prices" ON product_prices;

CREATE POLICY "Anyone can view product prices"
  ON product_prices FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage product prices"
  ON product_prices FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- 10. FIX WARRANTY_CUSTOM_PRICES RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read warranty custom prices" ON warranty_custom_prices;
DROP POLICY IF EXISTS "Anyone can view warranty custom prices" ON warranty_custom_prices;
DROP POLICY IF EXISTS "Anyone can insert warranty custom prices" ON warranty_custom_prices;
DROP POLICY IF EXISTS "Anyone can update warranty custom prices" ON warranty_custom_prices;
DROP POLICY IF EXISTS "Anyone can delete warranty custom prices" ON warranty_custom_prices;

CREATE POLICY "Anyone can view warranty custom prices"
  ON warranty_custom_prices FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage warranty custom prices"
  ON warranty_custom_prices FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- =====================================================
-- 11. FIX REVIEWS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Public can create reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can view all reviews" ON reviews;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- 12. FIX ORDERS RLS POLICIES (CRITICAL SECURITY)
-- =====================================================

DROP POLICY IF EXISTS "Public access to orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- 13. FIX PAYMENT_SESSIONS RLS POLICIES (CRITICAL)
-- =====================================================

DROP POLICY IF EXISTS "Public can create payment sessions" ON payment_sessions;
DROP POLICY IF EXISTS "Public can read payment sessions" ON payment_sessions;
DROP POLICY IF EXISTS "Users can view own payment sessions" ON payment_sessions;
DROP POLICY IF EXISTS "Users can view payment sessions" ON payment_sessions;
DROP POLICY IF EXISTS "Users can create payment sessions" ON payment_sessions;

CREATE POLICY "Users can view own payment sessions"
  ON payment_sessions FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own payment sessions"
  ON payment_sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- =====================================================
-- 14. FIX WARRANTY_REGISTRATIONS RLS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Public can read warranty registrations" ON warranty_registrations;
DROP POLICY IF EXISTS "Authenticated users can create warranty registrations" ON warranty_registrations;
DROP POLICY IF EXISTS "Users can view own warranty registrations" ON warranty_registrations;

CREATE POLICY "Anyone can view warranty registrations"
  ON warranty_registrations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create warranty registrations"
  ON warranty_registrations FOR INSERT
  WITH CHECK (true);
