import Stripe from "npm:stripe@12.4.0";
import { createClient } from "npm:@supabase/supabase-js@2.38.4";

// Define CORS headers directly in this file instead of importing from shared module
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize Stripe and Supabase clients
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "");
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { items, orderId, customerEmail, stripeProductId } = await req.json();

    if (!items || !items.length) {
      return new Response(JSON.stringify({ error: "No items provided" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Use fixed URLs for success and cancel
    const successUrl = "https://led-nabor.com/order-success?session_id={CHECKOUT_SESSION_ID}";
    const cancelUrl = "https://led-nabor.com/checkout";

    console.log("Creating checkout session with items:", JSON.stringify(items));
    
    // Create line items for Stripe
    const line_items = [];

    // Add product items
    for (const item of items) {
      console.log(`Processing item: ${item.id}, variant: ${item.variant.id}, stripePriceId: ${item.variant.stripePriceId}`);
      
      if (!item.variant.stripePriceId) {
        throw new Error(`Missing Stripe price ID for product variant: ${item.variant.id}`);
      }
      
      // Ensure quantity is a valid integer
      const quantity = parseInt(String(item.quantity), 10);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.id}: ${item.quantity}`);
      }

      line_items.push({
        price: item.variant.stripePriceId,
        quantity: quantity
      });
      
      // Add warranty if selected
      if (item.warranty?.stripePriceId) {
        console.log(`Adding warranty: ${item.warranty.stripePriceId}`);
        
        // Ensure warranty quantity matches item quantity
        const warrantyQuantity = parseInt(String(item.quantity), 10);
        if (isNaN(warrantyQuantity) || warrantyQuantity <= 0) {
          throw new Error(`Invalid warranty quantity for item ${item.id}: ${item.quantity}`);
        }
        
        line_items.push({
          price: item.warranty.stripePriceId,
          quantity: warrantyQuantity
        });
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: line_items,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orderId: orderId,
        company_name: "LED Nabor"
      },
      shipping_address_collection: {
        allowed_countries: ['CZ', 'SK', 'DE', 'AT', 'PL', 'HU'],
      },
      locale: "en",
    });

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});