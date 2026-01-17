/*
  # Create Product Videos Table

  1. New Tables
    - `product_videos`
      - `id` (uuid, primary key)
      - `product_id` (integer, references products)
      - `video_url` (text, full URL to video in storage)
      - `title` (text, optional video title)
      - `description` (text, optional description)
      - `order_position` (integer, for sorting videos)
      - `is_primary` (boolean, marks the main video)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `product_videos` table
    - Add policy for public to view videos
    - Add policy for authenticated users to manage videos
*/

-- Create product_videos table
CREATE TABLE IF NOT EXISTS product_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  title text,
  description text,
  order_position integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_videos_product_id ON product_videos(product_id);
CREATE INDEX IF NOT EXISTS idx_product_videos_order ON product_videos(product_id, order_position);

-- Enable RLS
ALTER TABLE product_videos ENABLE ROW LEVEL SECURITY;

-- Public can view all videos
CREATE POLICY "Anyone can view product videos"
  ON product_videos
  FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert videos
CREATE POLICY "Authenticated users can insert videos"
  ON product_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update videos
CREATE POLICY "Authenticated users can update videos"
  ON product_videos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete videos
CREATE POLICY "Authenticated users can delete videos"
  ON product_videos
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_product_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_videos_timestamp
  BEFORE UPDATE ON product_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_product_videos_updated_at();