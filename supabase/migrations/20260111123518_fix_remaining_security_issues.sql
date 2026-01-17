/*
  # Fix Remaining Security Issues

  ## Overview
  This migration fixes all remaining security vulnerabilities identified in the security audit.

  ## Critical Issues Fixed
  
  ### 1. Blog Posts
    - Change INSERT policy to admin-only (currently any authenticated user can create)
    - Change UPDATE and DELETE to admin-only
  
  ### 2. Warranty Registrations
    - Remove public SELECT access (contains sensitive customer data)
    - Add user-specific and admin-only SELECT policies
    - Add user_id column for proper access control
  
  ### 3. Price Operations Log
    - Remove public SELECT access (sensitive price change history)
    - Add admin-only SELECT policy
  
  ### 4. Products, Specifications, Variants
    - Add admin-only INSERT, UPDATE, DELETE policies
  
  ### 5. Warranty Tables
    - Add admin-only modification policies for warranty_policies and warranty_fixed_prices
  
  ## Security Impact
  - Prevents unauthorized blog post creation
  - Protects customer warranty data from public access
  - Secures price operations audit log
  - Locks down product catalog modifications to admins only
*/

-- =====================================================
-- 1. BLOG POSTS - ADMIN ONLY ACCESS
-- =====================================================

-- Drop existing weak policies
DROP POLICY IF EXISTS "Authenticated users can create blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authors can update posts in their translation group" ON blog_posts;
DROP POLICY IF EXISTS "Authors can delete posts in their translation group" ON blog_posts;

-- Create admin-only policies
CREATE POLICY "Admins can create blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 2. WARRANTY REGISTRATIONS - REMOVE PUBLIC ACCESS
-- =====================================================

-- Add user_id column if it doesn't exist (for proper access control)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'warranty_registrations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE warranty_registrations ADD COLUMN user_id uuid REFERENCES auth.users(id);
    
    -- Create index for performance
    CREATE INDEX IF NOT EXISTS idx_warranty_registrations_user_id 
    ON warranty_registrations(user_id);
  END IF;
END $$;

-- Drop dangerous public SELECT policy
DROP POLICY IF EXISTS "Anyone can view warranty registrations" ON warranty_registrations;

-- Create restricted access policies
CREATE POLICY "Users can view own warranty registrations"
  ON warranty_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can update warranty registrations"
  ON warranty_registrations FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete warranty registrations"
  ON warranty_registrations FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 3. PRICE OPERATIONS LOG - ADMIN ONLY ACCESS
-- =====================================================

-- Drop public access policy
DROP POLICY IF EXISTS "Public can read price operations log" ON price_operations_log;

-- Create admin-only policies
CREATE POLICY "Admins can view price operations log"
  ON price_operations_log FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert price operations log"
  ON price_operations_log FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete price operations log"
  ON price_operations_log FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 4. PRODUCTS TABLE - ADMIN ONLY MODIFICATIONS
-- =====================================================

-- Create admin-only modification policies
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 5. PRODUCT SPECIFICATIONS - ADMIN ONLY MODIFICATIONS
-- =====================================================

CREATE POLICY "Admins can insert product specifications"
  ON product_specifications FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product specifications"
  ON product_specifications FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete product specifications"
  ON product_specifications FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 6. PRODUCT VARIANTS - ADMIN ONLY MODIFICATIONS
-- =====================================================

CREATE POLICY "Admins can insert product variants"
  ON product_variants FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update product variants"
  ON product_variants FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete product variants"
  ON product_variants FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 7. WARRANTY POLICIES - ADMIN ONLY MODIFICATIONS
-- =====================================================

CREATE POLICY "Admins can insert warranty policies"
  ON warranty_policies FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update warranty policies"
  ON warranty_policies FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete warranty policies"
  ON warranty_policies FOR DELETE
  TO authenticated
  USING (is_admin());

-- =====================================================
-- 8. WARRANTY FIXED PRICES - ADMIN ONLY MODIFICATIONS
-- =====================================================

CREATE POLICY "Admins can insert warranty fixed prices"
  ON warranty_fixed_prices FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update warranty fixed prices"
  ON warranty_fixed_prices FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete warranty fixed prices"
  ON warranty_fixed_prices FOR DELETE
  TO authenticated
  USING (is_admin());
