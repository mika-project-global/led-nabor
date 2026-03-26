
/*
  # Add Missing Indexes for Performance

  ## Problem
  Several critical queries were doing full table scans due to missing indexes:
  
  1. `reviews` table (540 rows) had NO index on `product_id`
     - Every product page load scanned all 540 reviews
  
  2. `viewing_history` table (213K+ rows) had NO indexes on:
     - `user_id` - used to filter history by logged-in user
     - `session_id` - used to filter history by anonymous session
     - `product_id` - used to check if product was already viewed
  
  ## New Indexes
  
  - `idx_reviews_product_id` - fast lookup of reviews per product
  - `idx_viewing_history_user_id` - fast lookup by user
  - `idx_viewing_history_session_id` - fast lookup by session
  - `idx_viewing_history_product_session` - composite for the "already viewed?" check
  - `idx_viewing_history_product_user` - composite for the "already viewed?" check by user
  - `idx_blog_posts_published_locale` - composite for blog listing query
*/

-- Index for reviews by product_id (critical - was doing full table scan)
CREATE INDEX IF NOT EXISTS idx_reviews_product_id 
  ON public.reviews USING btree (product_id, created_at DESC);

-- Indexes for viewing_history (213K rows - was doing full table scans)
CREATE INDEX IF NOT EXISTS idx_viewing_history_user_id 
  ON public.viewing_history USING btree (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_viewing_history_session_id 
  ON public.viewing_history USING btree (session_id)
  WHERE user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_viewing_history_product_user 
  ON public.viewing_history USING btree (product_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_viewing_history_product_session 
  ON public.viewing_history USING btree (product_id, session_id)
  WHERE user_id IS NULL;

-- Composite index for blog listing query (published + locale + published_at)
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_locale 
  ON public.blog_posts USING btree (published, locale, published_at DESC)
  WHERE published = true;
