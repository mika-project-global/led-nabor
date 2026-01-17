/*
  # Add Stripe webhook handling tables

  1. New Tables
    - `stripe_events`
      - Stores incoming Stripe webhook events
      - Prevents duplicate processing
      - Tracks processing status
    
    - `payment_transactions`
      - Records all payment-related events
      - Maintains payment history
      - Links to orders and customers

  2. Security
    - Enable RLS on both tables
    - Add policies for service role access
*/

-- Create stripe_events table
CREATE TABLE IF NOT EXISTS stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  type text NOT NULL,
  data jsonb NOT NULL,
  processed boolean DEFAULT false,
  error text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  stripe_payment_intent_id text,
  stripe_charge_id text,
  amount numeric NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  type text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_events
CREATE POLICY "Service role can manage stripe events"
  ON stripe_events
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for payment_transactions
CREATE POLICY "Service role can manage payment transactions"
  ON payment_transactions
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster event lookups
CREATE INDEX stripe_events_type_idx ON stripe_events (type);
CREATE INDEX stripe_events_processed_idx ON stripe_events (processed);
CREATE INDEX payment_transactions_order_id_idx ON payment_transactions (order_id);
CREATE INDEX payment_transactions_payment_intent_idx ON payment_transactions (stripe_payment_intent_id);