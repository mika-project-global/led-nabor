/*
  # Fix blog_posts slug constraint to allow same slug for different locales

  1. Changes
    - Drop the existing unique constraint on slug column alone
    - Add a new unique constraint on (slug, locale) combination
    - This allows the same slug to be used for different language versions

  2. Security
    - No changes to RLS policies
*/

-- Drop the existing unique constraint on slug alone
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_slug_key;

-- Add a new unique constraint on (slug, locale) combination
ALTER TABLE blog_posts ADD CONSTRAINT blog_posts_slug_locale_key UNIQUE (slug, locale);
