/*
  # Add Reviews System

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `product_id` (integer, required)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `author_name` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Allow public to read reviews
    - Allow public to create reviews
*/

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  author_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public to read reviews
CREATE POLICY "Public can read reviews"
  ON reviews
  FOR SELECT
  TO public
  USING (true);

-- Allow public to create reviews
CREATE POLICY "Public can create reviews"
  ON reviews
  FOR INSERT
  TO public
  WITH CHECK (true);