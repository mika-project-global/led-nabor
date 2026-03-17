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

const PRODUCT_DESCRIPTIONS: Record<string, Record<number, string>> = {
  en: {
    1: "Complete LED ceiling lighting kit: COB RGB+CCT strip with adjustable color and white light (2700K–6500K), power supply, controller, and remote. Wi-Fi control via app and voice assistants. Warranty: 24 months.",
    2: "Complete LED ceiling lighting kit: COB CCT strip with adjustable white light (2700K–6500K), power supply, dimmer, and remote. Wi-Fi control via app and voice assistants. Warranty: 24 months.",
  },
  cz: {
    1: "Kompletní sada LED stropního osvětlení: COB RGB+CCT pásek s nastavitelnou barvou a bílým světlem (2700K–6500K), napájení, ovladač a dálkové ovládání. Wi-Fi ovládání přes aplikaci a hlasové asistenty. Záruka: 24 měsíců.",
    2: "Kompletní sada LED stropního osvětlení: COB CCT pásek s nastavitelným bílým světlem (2700K–6500K), napájení, stmívač a dálkové ovládání. Wi-Fi ovládání přes aplikaci a hlasové asistenty. Záruka: 24 měsíců.",
  },
  de: {
    1: "Komplettes LED-Deckenbeleuchtungs-Set: COB RGB+CCT-Streifen mit einstellbarer Farbe und Weißlicht (2700K–6500K), Netzteil, Steuerung und Fernbedienung. Wi-Fi-Steuerung per App und Sprachassistenten. Garantie: 24 Monate.",
    2: "Komplettes LED-Deckenbeleuchtungs-Set: COB CCT-Streifen mit einstellbarem Weißlicht (2700K–6500K), Netzteil, Dimmer und Fernbedienung. Wi-Fi-Steuerung per App und Sprachassistenten. Garantie: 24 Monate.",
  },
  pl: {
    1: "Kompletny zestaw oświetlenia sufitowego LED: taśma COB RGB+CCT z regulowanym kolorem i białym światłem (2700K–6500K), zasilacz, sterownik i pilot. Sterowanie Wi-Fi przez aplikację i asystentów głosowych. Gwarancja: 24 miesiące.",
    2: "Kompletny zestaw oświetlenia sufitowego LED: taśma COB CCT z regulowanym białym światłem (2700K–6500K), zasilacz, ściemniacz i pilot. Sterowanie Wi-Fi przez aplikację i asystentów głosowych. Gwarancja: 24 miesiące.",
  },
  uk: {
    1: "Комплект LED підсвітки стелі: COB стрічка RGB+CCT з регульованим кольором та білим світлом (2700K–6500K), блок живлення, контролер та пульт. Wi-Fi керування через додаток та голосові асистенти. Гарантія: 24 місяці.",
    2: "Комплект LED підсвітки стелі: COB стрічка CCT з регульованим білим світлом (2700K–6500K), блок живлення, диммер та пульт. Wi-Fi керування через додаток та голосові асистенти. Гарантія: 24 місяці.",
  },
  ru: {
    1: "Комплект LED подсветки потолка: COB лента RGB+CCT с регулируемым цветом и белым светом (2700K–6500K), блок питания, контроллер и пульт. Wi-Fi управление через приложение и голосовые ассистенты. Гарантия: 24 месяца.",
    2: "Комплект LED подсветки потолка: COB лента CCT с регулируемым белым светом (2700K–6500K), блок питания, диммер и пульт. Wi-Fi управление через приложение и голосовые ассистенты. Гарантия: 24 месяца.",
  },
};

const WARRANTY_LABEL: Record<string, string> = {
  cz: "Záruka",
  de: "Garantie",
  pl: "Gwarancja",
  uk: "Гарантія",
  ru: "Гарантия",
  en: "Warranty",
};

const WARRANTY_MONTHS_LABEL: Record<string, string> = {
  cz: "měsíců",
  de: "Monate",
  pl: "miesięcy",
  uk: "місяців",
  ru: "месяцев",
  en: "months",
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

      const description = (PRODUCT_DESCRIPTIONS[siteLocale] || PRODUCT_DESCRIPTIONS["en"])[item.id]
        || PRODUCT_DESCRIPTIONS["en"][item.id]
        || undefined;

      line_items.push({
        price_data: {
          currency: stripeCurrency,
          unit_amount: unitAmount,
          product_data: {
            name: `${item.name} ${item.variant?.length ?? ""}m`.trim(),
            description,
            images: item.image ? [item.image] : [],
          },
        },
        quantity,
      });

      if (item.warranty?.additionalCost && Number(item.warranty.additionalCost) > 0) {
        const warrantyAmount = Math.round(Number(item.warranty.additionalCost) * 100);
        const wLabel = WARRANTY_LABEL[siteLocale] || "Warranty";
        const wMonths = WARRANTY_MONTHS_LABEL[siteLocale] || "months";
        line_items.push({
          price_data: {
            currency: stripeCurrency,
            unit_amount: warrantyAmount,
            product_data: {
              name: `${wLabel} ${item.warranty.months} ${wMonths}`,
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
