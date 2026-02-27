/*
  # Add currency and locale fields to orders table

  ## Changes
  1. Add `currency` column to orders table
     - Type: text
     - Default: 'RUB'
     - Not nullable
  
  2. Add `locale` column to orders table
     - Type: text
     - Default: 'ru'
     - Not nullable

  ## Notes
  - These fields are needed for international order confirmation emails
  - Currency supports: RUB, EUR, CZK, PLN, USD, etc.
  - Locale supports: ru, en, cs, etc.
  - Default values ensure backward compatibility with existing orders
*/

-- Add currency column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'currency'
  ) THEN
    ALTER TABLE orders ADD COLUMN currency text NOT NULL DEFAULT 'RUB';
  END IF;
END $$;

-- Add locale column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'locale'
  ) THEN
    ALTER TABLE orders ADD COLUMN locale text NOT NULL DEFAULT 'ru';
  END IF;
END $$;
