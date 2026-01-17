/*
  # Add warranty policies system
  
  1. New Tables
    - `warranty_policies`
      - `id` (uuid, primary key)
      - `product_id` (integer)
      - `months` (integer)
      - `description` (text)
      - `terms` (text)
      - `price_multiplier` (numeric)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policy for public read access if not exists
*/

-- Create warranty policies table if not exists
CREATE TABLE IF NOT EXISTS warranty_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id integer NOT NULL,
  months integer NOT NULL,
  description text NOT NULL,
  terms text NOT NULL,
  price_multiplier numeric DEFAULT 0,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE warranty_policies ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists and recreate
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can read warranty policies" ON warranty_policies;
    
    CREATE POLICY "Public can read warranty policies"
      ON warranty_policies
      FOR SELECT
      TO public
      USING (true);
END $$;

-- Create or replace trigger function
CREATE OR REPLACE FUNCTION handle_warranty_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS warranty_policies_updated_at ON warranty_policies;
CREATE TRIGGER warranty_policies_updated_at
  BEFORE UPDATE ON warranty_policies
  FOR EACH ROW
  EXECUTE PROCEDURE handle_warranty_updated_at();

-- Clear existing data and insert warranty policies
TRUNCATE warranty_policies;

INSERT INTO warranty_policies (
  product_id, 
  months, 
  description, 
  terms, 
  price_multiplier, 
  is_default
)
SELECT
  product_id,
  months,
  description,
  terms,
  price_multiplier,
  is_default
FROM (
  SELECT generate_series(1, 24) AS product_id
) p
CROSS JOIN (
  VALUES
    (
      24,
      'Стандартная гарантия 24 месяца',
      'Гарантия распространяется на заводские дефекты и неисправности, возникшие по вине производителя. В случае обнаружения дефекта мы бесплатно заменим товар на новый или вернем деньги.',
      0::numeric,
      true
    ),
    (
      36,
      'Расширенная гарантия 36 месяцев',
      'Включает стандартную гарантию плюс расширенное покрытие на компоненты. Дополнительная защита от производственных дефектов и преждевременного износа.',
      0.10,
      false
    ),
    (
      48,
      'Расширенная гарантия 48 месяцев',
      'Максимальная защита вашего оборудования на 4 года. Полное покрытие всех компонентов и расширенная техническая поддержка.',
      0.15,
      false
    )
) AS w (months, description, terms, price_multiplier, is_default);