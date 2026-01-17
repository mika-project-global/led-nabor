import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Package, Banknote, CreditCard } from 'lucide-react';
import { Order, CartItem } from '../types';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import { useTranslation } from '../hooks/useTranslation';

export default function OrderSuccess() {
  const { t } = useTranslation();
  const location = useLocation();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | undefined>(location.state?.order);
  const sessionId = new URLSearchParams(location.search).get('session_id');
  const [isLoading, setIsLoading] = useState(false);
  const [stripeOrder, setStripeOrder] = useState<Order | null>(null);

  // Check for cash on delivery order in sessionStorage
  useEffect(() => {
    const codOrderJson = sessionStorage.getItem('cod_order');
    if (codOrderJson && !order) {
      try {
        const codOrder = JSON.parse(codOrderJson);
        setOrder(codOrder);
        // Clear the session storage after retrieving the order
        sessionStorage.removeItem('cod_order');
      } catch (error) {
        console.error('Error parsing cash on delivery order:', error);
      }
    }
  }, [order]);

  // Fetch order data from Supabase if we have a session ID but no order data
  useEffect(() => {
    const fetchOrderFromSessionId = async () => {
      if (sessionId && !order) {
        setIsLoading(true);
        try {
          // Find the payment session with this session ID
          const { data: paymentSession, error: sessionError } = await supabase
            .from('payment_sessions')
            .select('order_id, status')
            .eq('stripe_session_id', sessionId) 
            .single();

          if (sessionError || !paymentSession) {
            console.error('Error fetching payment session:', sessionError);
            return;
          }

          // Get the order details
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', paymentSession.order_id)
            .single();

          if (orderError || !orderData) {
            console.error('Error fetching order:', orderError);
            return;
          }

          setStripeOrder({
            id: orderData.id,
            items: orderData.items,
            total: orderData.total,
            customerInfo: orderData.customer_info,
            deliveryMethod: orderData.delivery_method,
            paymentMethod: orderData.payment_method,
            status: orderData.status,
            createdAt: orderData.created_at
          });
          
          // Clear the cart on successful payment
          clearCart();
        } catch (error) {
          console.error('Error fetching order data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrderFromSessionId();
  }, [sessionId, order, clearCart]);

  // If we don't have order data, no session ID, and not loading, redirect to home
  if (!order && !sessionId && !isLoading && !stripeOrder && !sessionStorage.getItem('cod_order')) {
    return <Navigate to="/" replace />;
  }
  
  // Clear cart if we have a successful order
  useEffect(() => {
    if (order || stripeOrder || sessionId) {
      clearCart();
    }
  }, [order, stripeOrder, sessionId, clearCart]);

  // Show loading state while fetching order data
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Use either the order from location state or the one fetched from Stripe session
  const displayOrder = order || stripeOrder;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO
        title={t('order.success')}
        description={t('order.success_message')}
      />

      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="text-green-500" size={64} />
        </div>
        <h1 className="text-3xl font-bold mb-4">{t('order.success')}</h1>
        <p className="text-gray-600 mb-8">{t('order.success_message')}</p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8"> 
          {displayOrder && (
            <>
              <div className="flex items-center justify-center gap-2 text-lg font-medium mb-4">
                <Package size={24} />
                <span>{t('order.order_number')}: {displayOrder.id}</span>
              </div>
              <p className="text-gray-600">
                {t('order.confirmation_email_sent')} {displayOrder.customerInfo.email}
              </p>

              <div className="mt-6 text-left">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  {displayOrder.paymentMethod.type === 'cash' ? (
                    <>
                      <Banknote size={20} />
                      {t('order.cash_on_delivery')}
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      {t('checkout.pay_with_card')}
                    </>
                  )}
                </h3>
                <p className="text-gray-600">
                  {displayOrder.paymentMethod.type === 'cash'
                    ? t('order.pay_on_delivery_message')
                    : t('order.payment_success_message')}
                </p>
              </div>
            </>
          )}
          
          {!displayOrder && sessionId && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                {t('order.order_paid_message')}
              </p>
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CreditCard size={20} />
                <span>{t('order.payment_processed')}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="block w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            {t('order.continue_shopping')}
          </Link>
          <button
            onClick={() => window.print()}
            className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('order.print_order')}
          </button>
        </div>
      </div>
    </div>
  );
}