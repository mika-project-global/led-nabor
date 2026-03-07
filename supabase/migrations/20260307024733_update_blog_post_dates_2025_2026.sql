/*
  # Update Blog Post Dates to 2025-2026
  
  1. Changes
    - Updates published_at dates for all blog posts
    - Distributes dates across 2025 and 2026
    - Each post gets a unique date for better sorting
    - Newer SEO articles get more recent dates (2026)
    - Older articles get dates from 2025
    
  2. Notes
    - Maintains relative order of articles
    - Creates realistic publication timeline
    - Improves blog appearance and sorting
*/

-- Update blog post dates to spread across 2025-2026
-- Articles will be distributed chronologically based on their created_at order

DO $$
DECLARE
  post_record RECORD;
  date_counter INTEGER := 0;
  base_date TIMESTAMP := '2025-01-15 10:00:00';
  days_increment INTEGER;
BEGIN
  -- Loop through all published posts ordered by created_at
  FOR post_record IN 
    SELECT id 
    FROM blog_posts 
    WHERE published = true 
    ORDER BY created_at ASC
  LOOP
    -- Calculate days to add (roughly every 10-20 days)
    days_increment := (date_counter * 15);
    
    -- Update the post with new date
    UPDATE blog_posts 
    SET published_at = base_date + (days_increment || ' days')::INTERVAL + (FLOOR(RANDOM() * 8) || ' hours')::INTERVAL
    WHERE id = post_record.id;
    
    date_counter := date_counter + 1;
  END LOOP;
END $$;