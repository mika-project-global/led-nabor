/*
  # Change blog_posts published default to true

  1. Modified Tables
    - `blog_posts`
      - Changed `published` column default from `false` to `true`
  
  2. Reason
    - When translations are inserted (via migrations or scripts), 
      they should be published by default
    - Admins can still unpublish posts through the UI if needed
*/

ALTER TABLE blog_posts ALTER COLUMN published SET DEFAULT true;
