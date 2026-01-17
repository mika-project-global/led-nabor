/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (integer, primary key)
      - `name` (text, product name)
      - `variants` (jsonb, array of product variants with length and price)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access
    - Add policy for authenticated users to manage products

  3. Sample Data
    - Insert initial product data matching the current hardcoded values
*/

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id integer PRIMARY KEY,
  name text NOT NULL,
  variants jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can read products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Insert initial data
INSERT INTO public.products (id, name, variants)
VALUES 
  (1, 'Универсальный RGB+CCT набор', '[
    {"id": "rgb-5", "length": 5, "price": 5350},
    {"id": "rgb-10", "length": 10, "price": 28000},
    {"id": "rgb-15", "length": 15, "price": 40000},
    {"id": "rgb-20", "length": 20, "price": 52000},
    {"id": "rgb-25", "length": 25, "price": 65000},
    {"id": "rgb-30", "length": 30, "price": 78000}
  ]'::jsonb),
  (2, 'Белая CCT подсветка', '[
    {"id": "cct-5", "length": 5, "price": 12000},
    {"id": "cct-10", "length": 10, "price": 22000},
    {"id": "cct-15", "length": 15, "price": 32000},
    {"id": "cct-20", "length": 20, "price": 42000},
    {"id": "cct-25", "length": 25, "price": 52000},
    {"id": "cct-30", "length": 30, "price": 62000}
  ]'::jsonb);