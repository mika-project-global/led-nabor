# Email System - Production Setup Guide

## Overview

Production-ready email system for international e-commerce with:
- **Multi-currency support**: RUB, EUR, CZK, PLN, USD, etc.
- **Multi-language**: English, Russian, Czech
- **HTML + Plain text**: Maximum email client compatibility
- **Production domain**: Custom sender with Reply-To support
- **Guest & authenticated**: Works for all order types

## What's Implemented

### Database Changes
- **Migration**: Added `currency` and `locale` fields to `orders` table
- **Defaults**: `currency='RUB'`, `locale='ru'` for backward compatibility

### Frontend Changes
- **`src/pages/Checkout.tsx`**:
  - Saves current `currency` and `language` from LocaleContext to order
  - Calls `send-order-confirmation` Edge Function after order creation
  - Non-blocking error handling (order always succeeds even if email fails)

### Edge Function
- **`supabase/functions/send-order-confirmation/index.ts`**:
  - Multi-currency formatting using `Intl.NumberFormat`
  - Translation dictionary for EN, RU, CS
  - Payment method localization (COD/Stripe)
  - HTML + Plain text email versions
  - Reply-To header support
  - Production-ready logging

## Environment Variables

### Required for Email to Work

| Variable | Description | Get From |
|----------|-------------|----------|
| `RESEND_API_KEY` | API key for Resend | [resend.com/api-keys](https://resend.com/api-keys) |

### Optional (with Smart Defaults)

| Variable | Default | Production Value | Description |
|----------|---------|------------------|-------------|
| `FROM_EMAIL` | `onboarding@resend.dev` | `orders@led-nabor.com` | Sender email |
| `REPLY_TO_EMAIL` | (none) | `support@led-nabor.com` | Reply-To address |
| `ADMIN_EMAIL` | (none) | `admin@led-nabor.com` | Admin notifications |

## Setup Instructions

### Step 1: Get Resend API Key

1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Navigate to [API Keys](https://resend.com/api-keys)
3. Click "Create API Key"
4. Copy the key (starts with `re_`)

### Step 2: Configure Secrets in Supabase

Secrets are **automatically configured** during deployment. To update:

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **Settings** → **Edge Functions**
3. Click **Manage secrets**
4. Add/update:

```bash
# Required
RESEND_API_KEY=re_your_key_here

# Optional (for testing)
FROM_EMAIL=onboarding@resend.dev
ADMIN_EMAIL=your-email@gmail.com

# Optional (for production)
FROM_EMAIL=orders@led-nabor.com
REPLY_TO_EMAIL=support@led-nabor.com
ADMIN_EMAIL=admin@led-nabor.com
```

### Step 3: Production Email Setup

For production with your domain:

1. **Add Domain to Resend**
   - In Resend: Settings → Domains → Add Domain
   - Enter your domain: `led-nabor.com`

2. **Configure DNS Records**
   - Add the MX, TXT, and CNAME records shown by Resend
   - In your DNS provider (e.g., Cloudflare, Namecheap)
   - Wait 5-10 minutes for propagation

3. **Verify Domain**
   - Resend will verify your domain automatically
   - Status will change to "Verified"

4. **Update Secrets**
   - Update `FROM_EMAIL` to `orders@led-nabor.com`
   - Add `REPLY_TO_EMAIL` as `support@led-nabor.com`

## How It Works

### Currency Formatting

Orders store the currency and locale:

```typescript
// Order data in database
{
  currency: "CZK",  // or EUR, RUB, PLN, USD
  locale: "en",     // or ru, cs
  total: 1500
}
```

Formatted automatically:
```typescript
formatCurrency(1500, "CZK", "en")  // → "CZK 1,500"
formatCurrency(1500, "EUR", "cs")  // → "1 500 €"
formatCurrency(1500, "RUB", "ru")  // → "1 500 ₽"
```

### Email Languages

Translation dictionary supports 3 languages:
- **English (`en`)**: Default, used as fallback
- **Russian (`ru`)**: Full translation
- **Czech (`cs`)**: Full translation

Email subject examples:
- EN: `Order Confirmed: 550e8400`
- RU: `Заказ подтвержден: 550e8400`
- CS: `Objednávka potvrzena: 550e8400`

### Payment Methods

Localized based on order locale:

| Type | English | Russian | Czech |
|------|---------|---------|-------|
| COD | Cash on Delivery | Наложенный платеж | Dobírka |
| Card | Card Payment (Stripe) | Оплата картой (Stripe) | Platba kartou (Stripe) |

## Testing

### 1. Test Email Flow

1. Add product to cart
2. Go to checkout
3. Fill form with **real email**
4. Complete order
5. Check:
   - Browser console for `[EMAIL]` logs
   - Email inbox (check spam folder)
   - Admin email for notification

### 2. Test Different Languages

Switch language in header, then checkout:
- English: Emails in English with appropriate currency format
- Русский: Письма на русском
- Čeština: E-maily v češtině

### 3. Check Logs

Supabase Dashboard → Edge Functions → send-order-confirmation → Logs

Look for:
```
[ORDER CONFIRMATION] Currency: CZK Locale: en
[RESEND SUCCESS] { id: "..." }
[ORDER CONFIRMATION] Customer email sent successfully
```

## Troubleshooting

### Emails Not Arriving

1. **Check spam folder** - especially for `onboarding@resend.dev`
2. **Check Resend quota** - Free: 100 emails/day
3. **Check logs** - Supabase Edge Functions logs
4. **Check API key** - Verify in Resend dashboard
5. **Check secrets** - Ensure `RESEND_API_KEY` is set

### Currency Not Formatting

1. **Check order data** - Should have `currency` field
2. **Check console** - Look for `[FORMAT CURRENCY ERROR]`
3. **Fallback active** - Will use `RUB` if currency invalid

### Wrong Language

1. **Check order data** - Should have `locale` field
2. **Check LocaleContext** - Verify `language` state
3. **Fallback active** - Will use `en` if locale invalid

## Email Examples

### Customer Email (CZK, English)

**Subject**: Order Confirmed: 550e8400

**Content**:
```
Hello, John!

Thank you for your order. We have received it and started processing.

Order number: 550e8400-e29b-41d4-a716-446655440000

Order details
---------------------------------------------
LED Strip 5m (5 meters) x1 - CZK 1,500

Total: CZK 1,500

Delivery information
Address: Street 123, Prague, 11000, Czech Republic
Phone: +420123456789
Payment method: Card Payment (Stripe)
```

### Admin Email (RUB, Russian)

**Subject**: Новый заказ: 550e8400

**Content**:
```
Новый заказ: 550e8400-e29b-41d4-a716-446655440000

Информация о клиенте
Имя: Иван Петров
Email: ivan@example.com
Телефон: +79001234567
Адрес: Улица 1, Москва, 101000, Россия

Детали заказа
LED-лента 5м (5 метров) x2 - 3 000 ₽

Итого: 3 000 ₽

Способ оплаты: Наложенный платеж
Статус: pending
```

## Resend Limits

### Free Plan
- **100 emails/day**
- **1 domain**
- **3,000 emails/month**

### Paid Plans
- Starting at $20/month
- 50,000 emails/month
- Multiple domains
- Better deliverability

## Security

- Edge Function is **public** (`verify_jwt: false`)
- Service Role Key only used **server-side** to read orders
- Frontend uses **Anon Key** only
- RLS policies **remain enabled**
- No sensitive data in logs
- Email failures **don't block** order creation

## Next Steps

- [x] Database migration applied (currency, locale fields)
- [x] Checkout updated to save currency/locale
- [x] Edge Function deployed with multi-currency/language
- [x] HTML + Plain text email support
- [x] Reply-To header support
- [ ] Get Resend API key
- [ ] Configure Supabase secrets
- [ ] Test email in all languages
- [ ] Set up production domain (optional)
- [ ] Configure production FROM_EMAIL and REPLY_TO (optional)

## Support

For issues:
1. Check Supabase Edge Function logs
2. Check browser console (F12)
3. Verify Resend API key is active
4. Test with `onboarding@resend.dev` first
5. Check Resend dashboard for delivery status
