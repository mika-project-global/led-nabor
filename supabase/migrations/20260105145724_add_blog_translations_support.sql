/*
  # Add translation support for blog posts

  1. Changes
    - Add `translation_group_id` column to link related translations
    - Add unique constraint on (translation_group_id, locale)
    - Update existing posts to have translation_group_id

  2. Purpose
    - Allow multiple language versions of the same article
    - Link translations together
    - Ensure only one version per language in a translation group
*/

-- Add translation_group_id column
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS translation_group_id uuid;

-- For existing posts, set translation_group_id to their own id
UPDATE blog_posts 
SET translation_group_id = id 
WHERE translation_group_id IS NULL;

-- Make translation_group_id required
ALTER TABLE blog_posts 
ALTER COLUMN translation_group_id SET NOT NULL;

-- Add unique constraint to ensure only one translation per language in a group
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blog_posts_translation_group_locale_unique'
  ) THEN
    ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_translation_group_locale_unique 
    UNIQUE (translation_group_id, locale);
  END IF;
END $$;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_posts_translation_group 
ON blog_posts(translation_group_id);