# Send Order Confirmation Email

Production-ready Edge Function for sending multilingual, multi-currency order confirmation emails.

## Features

- **Multi-currency support**: Formats prices in RUB, EUR, CZK, PLN, USD, etc.
- **Multi-language support**: Email content in English, Russian, Czech
- **HTML + Plain text**: Both formats for maximum compatibility
- **Production email**: Supports custom domain emails with Reply-To
- **Guest & authenticated orders**: Works for all customer types
- **Localized payment methods**: COD and Stripe with translations

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | API key from [resend.com](https://resend.com/api-keys) | `re_xxxxxxxxxx` |

### Optional

| Variable | Description | Default | Production Example |
|----------|-------------|---------|-------------------|
| `FROM_EMAIL` | Sender email address | `onboarding@resend.dev` | `orders@led-nabor.com` |
| `REPLY_TO_EMAIL` | Reply-To email address | (none) | `support@led-nabor.com` |
| `ADMIN_EMAIL` | Admin notification email | (none) | `admin@led-nabor.com` |

### Setup for Production

1. **Get Resend API Key**
   - Sign up at [resend.com](https://resend.com)
   - Go to [API Keys](https://resend.com/api-keys)
   - Create new API key
   - Copy the key (starts with `re_`)

2. **Add Your Domain to Resend**
   - In Resend: Settings → Domains → Add Domain
   - Add DNS records (MX, TXT, CNAME) to your domain
   - Wait for verification (5-10 minutes)
   - Update `FROM_EMAIL` to use your domain

3. **Configure Secrets in Supabase**
   - Secrets are automatically configured on deployment
   - To update: Supabase Dashboard → Settings → Edge Functions → Manage secrets

## How It Works

### Currency & Language Detection

The function reads `currency` and `locale` fields from the order:

```typescript
// Example order data
{
  id: "uuid",
  currency: "CZK",  // or "EUR", "RUB", "PLN", etc.
  locale: "en",     // or "ru", "cs"
  // ... other fields
}
```

Prices are formatted using `Intl.NumberFormat`:

```typescript
formatCurrency(1500, "CZK", "en")  // → "CZK 1,500"
formatCurrency(1500, "EUR", "cs")  // → "1 500 €"
formatCurrency(1500, "RUB", "ru")  // → "1 500 ₽"
```

### Email Templates

Each email includes:
- **HTML version**: Beautiful gradient design, responsive tables
- **Plain text version**: Simple text fallback for email clients

Supported languages:
- `en`: English
- `ru`: Russian (Русский)
- `cs`: Czech (Čeština)

Falls back to English if locale not supported.

### Payment Method Localization

Payment methods are localized based on order locale:

| Type | English | Russian | Czech |
|------|---------|---------|-------|
| COD | Cash on Delivery | Наложенный платеж | Dobírka |
| Stripe | Card Payment (Stripe) | Оплата картой (Stripe) | Platba kartou (Stripe) |

## API Usage

Called automatically from `Checkout.tsx` after order creation:

```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/send-order-confirmation`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      orderId: '550e8400-e29b-41d4-a716-446655440000',
      email: 'customer@example.com',
    }),
  }
);
```

## Logging

All operations are logged with prefixes:
- `[ORDER CONFIRMATION]` - Main process steps
- `[RESEND SUCCESS]` - Successful email sends
- `[RESEND ERROR]` - API errors
- `[FORMAT CURRENCY ERROR]` - Currency formatting issues

View logs: Supabase Dashboard → Edge Functions → send-order-confirmation → Logs

## Error Handling

- **Customer email fails**: Returns 500 error (critical)
- **Admin email fails**: Logs warning only (non-critical)
- **Frontend**: Errors don't block order creation
- **Fallbacks**: Invalid currency/locale defaults to RUB/en

## Email Examples

### Customer Email (English)
Subject: `Order Confirmed: 550e8400`

Content:
- Greeting with customer name
- Order number in highlighted box
- Order items table with quantities and prices
- Total in customer's currency
- Delivery address and payment method
- Support contact info

### Admin Email (English)
Subject: `New Order: 550e8400`

Content:
- Customer contact information
- Full order details table
- Order status and creation date
- All in admin's preferred language

## Testing

```bash
# Test with different locales and currencies
curl -X POST "${SUPABASE_URL}/functions/v1/send-order-confirmation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -d '{
    "orderId": "your-order-id",
    "email": "test@example.com"
  }'
```

## Security

- Uses `verify_jwt: false` (public endpoint)
- Service Role Key only used server-side
- Frontend uses Anon Key only
- RLS policies remain enabled
- No sensitive data in logs
