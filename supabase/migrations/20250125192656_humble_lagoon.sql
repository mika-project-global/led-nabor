/*
  # Create orders tables

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `customer_info` (jsonb)
      - `items` (jsonb)
      - `total` (numeric)
      - `delivery_method` (jsonb)
      - `payment_method` (jsonb)
      - `status` (text)
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on `orders` table
    - Add policy for authenticated users to read their own orders
    - Add policy for authenticated users to create orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_info jsonb NOT NULL,
  items jsonb NOT NULL,
  total numeric NOT NULL,
  delivery_method jsonb NOT NULL,
  payment_method jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);