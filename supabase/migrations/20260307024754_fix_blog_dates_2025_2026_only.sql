/*
  # Fix Blog Post Dates to Stay Within 2025-2026
  
  1. Changes
    - Updates published_at dates for all blog posts
    - Distributes dates across 2025 and 2026 only
    - Each post gets a unique date for better sorting
    - Spreads posts more evenly across the time period
    
  2. Notes
    - Keeps all dates within 2025-2026
    - Creates realistic publication timeline
    - Maintains chronological order
*/

-- Update blog post dates to spread across 2025-2026 (no 2027)
DO $$
DECLARE
  post_record RECORD;
  date_counter INTEGER := 0;
  total_posts INTEGER;
  base_date TIMESTAMP := '2025-02-01 10:00:00';
  days_between INTEGER;
BEGIN
  -- Count total published posts
  SELECT COUNT(*) INTO total_posts FROM blog_posts WHERE published = true;
  
  -- Calculate days between posts to fit within ~700 days (2 years)
  days_between := FLOOR(700.0 / total_posts);
  
  -- Loop through all published posts ordered by created_at
  FOR post_record IN 
    SELECT id 
    FROM blog_posts 
    WHERE published = true 
    ORDER BY created_at ASC
  LOOP
    -- Update the post with new date
    UPDATE blog_posts 
    SET published_at = base_date + (date_counter * days_between || ' days')::INTERVAL + (FLOOR(RANDOM() * 12) || ' hours')::INTERVAL
    WHERE id = post_record.id;
    
    date_counter := date_counter + 1;
  END LOOP;
END $$;