import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Get environment variables
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Initialize Stripe
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "No signature provided" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        },
      });
    }

    // Get the request body as text
    const body = await req.text();

    // Verify the event with Stripe
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (error) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        },
      });
    }

    console.log(`Received event: ${event.type}`);

    // Store the event in the database
    const { data: eventData, error: eventError } = await supabase
      .from("stripe_events")
      .insert({
        stripe_event_id: event.id,
        type: event.type,
        data: event.data,
      });

    if (eventError) {
      console.error("Error storing event:", eventError);
      // Continue processing even if storing fails
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        
        // Get the order ID from the metadata
        const orderId = session.metadata?.orderId;
        
        if (!orderId) {
          console.error("No order ID found in session metadata");
          break;
        }
        
        // Update the order status to "paid"
        const { error: orderError } = await supabase
          .from("orders")
          .update({ status: "paid" })
          .eq("id", orderId);
        
        if (orderError) {
          console.error("Error updating order:", orderError);
          break;
        }
        
        // Update the payment session status
        const { error: sessionError } = await supabase
          .from("payment_sessions")
          .update({ status: "completed" })
          .eq("stripe_session_id", session.id);
        
        if (sessionError) {
          console.error("Error updating payment session:", sessionError);
        }
        
        // Create a payment transaction record
        const { error: transactionError } = await supabase
          .from("payment_transactions")
          .insert({
            order_id: orderId,
            stripe_payment_intent_id: session.payment_intent,
            amount: session.amount_total / 100, // Convert from cents
            currency: session.currency,
            status: "completed",
            type: "payment",
            metadata: {
              session_id: session.id,
              payment_status: session.payment_status,
              customer_email: session.customer_details?.email
            }
          });
        
        if (transactionError) {
          console.error("Error creating transaction:", transactionError);
        }
        
        break;
      }
      
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        
        // Create a payment transaction record
        const { error: transactionError } = await supabase
          .from("payment_transactions")
          .insert({
            stripe_payment_intent_id: paymentIntent.id,
            stripe_charge_id: paymentIntent.latest_charge,
            amount: paymentIntent.amount / 100, // Convert from cents
            currency: paymentIntent.currency,
            status: "succeeded",
            type: "payment_intent",
            metadata: paymentIntent.metadata
          });
        
        if (transactionError) {
          console.error("Error creating transaction:", transactionError);
        }
        
        break;
      }
      
      // Handle other event types as needed
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      },
    });
  }
});