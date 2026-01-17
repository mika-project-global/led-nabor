import { loadStripe } from '@stripe/stripe-js';
import { CartItem, Order } from '../types';
import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

// Get environment variables properly
const supabaseUrl = __SUPABASE_URL__ || '';
const supabaseAnonKey = __SUPABASE_ANON_KEY__ || '';

// Create a Supabase client for edge function calls
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Stripe with the public key
const stripePromise = loadStripe(__STRIPE_PUBLIC_KEY__ || '');

export async function createCheckoutSession(order: Order): Promise<{ id: string } | { error: string }> {
  try {
    // Create a serializable order object without React elements or circular references
    const serializableItems = order.items.map(item => {
      // Ensure stripePriceId is included
      const stripePriceId = item.variant.stripePriceId;
      
      // Ensure item.quantity is a valid number
      const quantity = parseInt(String(item.quantity), 10);
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error(`Invalid quantity for item ${item.id}: ${item.quantity}`);
      }
      
      return {
        id: item.id,
        name: item.name,
        quantity: quantity, // Use validated quantity
        price: item.variant.price,
        image: item.image,
        variant: {
          id: item.variant.id,
          stripePriceId: stripePriceId,
          length: item.variant.length
        },
        warranty: item.warranty ? {
          policyId: item.warranty.policyId,
          months: item.warranty.months,
          stripePriceId: item.warranty.stripePriceId
        } : undefined
      };
    });

    // Call the Supabase Edge Function to create a Stripe checkout session
    const { data, error } = await supabaseClient.functions.invoke('create-checkout-session', {
      body: {
        items: serializableItems,
        orderId: order.id,
        customerEmail: order.customerInfo.email,
        stripeProductId: order.stripeProductId
      }
    });

    if (error) {
      console.error('Error creating checkout session:', error);
      return { error: error.message };
    }

    if (!data || !data.id) {
      console.error('Failed to create checkout session - no data or ID returned');
      return { error: 'Failed to create checkout session' };
    }

    // Update order status to pending_payment
    await supabase
      .from('orders')
      .update({ status: 'pending_payment' })
      .eq('id', order.id);

    // Create payment session record
    await supabase
      .from('payment_sessions')
      .insert({
        order_id: order.id,
        stripe_session_id: data.id,
        status: 'pending',
        amount: order.total,
        currency: 'czk',
        user_id: order.userId
      });

    // Load Stripe and redirect to checkout
    const stripe = await stripePromise;
    if (!stripe) {
      return { error: 'Failed to load Stripe' };
    }

    // Redirect to the Stripe checkout page
    const result = await stripe.redirectToCheckout({
      sessionId: data.id
    });

    if (result.error) {
      return { error: result.error.message };
    }

    return { id: data.id };
  } catch (error) {
    console.error('Error in createCheckoutSession:', error.message || error);
    return { error: typeof error === 'string' ? error : (error.message || 'An unknown error occurred') };
  }
}

export async function createCashOnDeliveryOrder(order: Order): Promise<boolean> {
  try {
    // Create a simplified order object without React elements or circular references
    const cleanOrder = {
      id: order.id,
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        variant: {
          id: item.variant.id,
          length: item.variant.length,
          price: item.variant.price
        },
        warranty: item.warranty,
        image: item.image
      })),
      total: order.total,
      customerInfo: order.customerInfo,
      deliveryMethod: {
        id: order.deliveryMethod.id,
        name: order.deliveryMethod.name,
        price: order.deliveryMethod.price,
        currency: order.deliveryMethod.currency,
        estimatedDays: order.deliveryMethod.estimatedDays
      },
      paymentMethod: {
        id: order.paymentMethod.id,
        name: order.paymentMethod.name,
        type: order.paymentMethod.type
      },
      status: 'pending_cod',
      createdAt: order.createdAt
    };

    // Update order status to indicate cash on delivery
    const { error } = await supabase
      .from('orders')
      .update({ status: 'pending_cod' }) // pending cash on delivery
      .eq('id', order.id);

    if (error) throw error;
    
    // Store the clean order in sessionStorage for retrieval on the success page
    sessionStorage.setItem('cod_order', JSON.stringify(cleanOrder));
    
    return true; 
  } catch (error) {
    console.error('Error creating cash on delivery order:', error);
    throw error;
  }
}