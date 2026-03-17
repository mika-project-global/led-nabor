import Stripe from "npm:stripe@12.4.0";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CURRENCY_LOWER: Record<string, string> = {
  CZK: "czk",
  EUR: "eur",
  PLN: "pln",
  UAH: "uah",
  GBP: "gbp",
  USD: "usd",
};

const LOCALE_STRIPE_LOCALE: Record<string, string> = {
  cz: "cs",
  de: "de",
  pl: "pl",
  uk: "auto",
  en: "en",
  ru: "auto",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { items, orderId, customerEmail, locale, currency } = await req.json();

    if (!items || !items.length) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const siteLocale = locale || "en";
    const stripeCurrency = currency ? (CURRENCY_LOWER[currency] || "czk") : "czk";
    const stripeLocale = LOCALE_STRIPE_LOCALE[siteLocale] || "en";

    const successUrl = `https://led-nabor.com/${siteLocale}/order-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `https://led-nabor.com/${siteLocale}/checkout`;

    console.log(`Creating checkout: currency=${stripeCurrency}, locale=${siteLocale}`);

    const line_items = [];

    for (const item of items) {
      const quantity = parseInt(String(item.quantity), 10);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.id}: ${item.quantity}`);
      }

      const rawPrice = item.variant?.price ?? item.price;
      const unitAmount = Math.round(Number(rawPrice) * 100);
      if (!unitAmount || unitAmount <= 0) {
        throw new Error(`Invalid price for item ${item.id}: ${rawPrice}`);
      }

      line_items.push({
        price_data: {
          currency: stripeCurrency,
          unit_amount: unitAmount,
          product_data: {
            name: `${item.name} ${item.variant?.length ?? ""}m`.trim(),
            images: item.image ? [item.image] : [],
          },
        },
        quantity,
      });

      if (item.warranty?.additionalCost && Number(item.warranty.additionalCost) > 0) {
        const warrantyAmount = Math.round(Number(item.warranty.additionalCost) * 100);
        line_items.push({
          price_data: {
            currency: stripeCurrency,
            unit_amount: warrantyAmount,
            product_data: {
              name: `Warranty ${item.warranty.months} months`,
            },
          },
          quantity,
        });
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: orderId,
        company_name: "LED Nabor",
      },
      shipping_address_collection: {
        allowed_countries: ["CZ", "SK", "DE", "AT", "PL", "HU", "UA", "GB"],
      },
      locale: stripeLocale as any,
    });

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
