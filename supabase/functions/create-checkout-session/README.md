# Stripe Checkout Session Function

This Edge Function creates a Stripe Checkout Session for processing payments.

## Environment Variables

- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `SUPABASE_ACCESS_TOKEN`: Your Supabase access token

## Deployment

Deploy using the Supabase CLI:

```bash
supabase functions deploy create-checkout-session
```

## Testing

Test the function using curl:

```bash
curl -i --request POST 'https://[PROJECT_REF].supabase.co/functions/v1/create-checkout-session' \
  --header 'Authorization: Bearer [ANON_KEY]' \
  --header 'Content-Type: application/json' \
  --data '{"items":[{"id":1,"name":"Test Product","price":1000,"quantity":1}],"customerEmail":"test@example.com"}'
```