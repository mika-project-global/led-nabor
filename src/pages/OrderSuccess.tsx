import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Package, Banknote, CreditCard, ShoppingBag, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { SEO } from '../components/SEO';
import { useTranslation } from '../hooks/useTranslation';
import { trackPurchase } from '../lib/analytics';

interface FetchedOrder {
  id: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    variant: { id: string; length: number; price: number };
    warranty?: { months: number; additionalCost: number };
    image: string;
  }>;
  total: number;
  customer_info: {
    email: string;
    firstName: string;
    lastName: string;
  };
  delivery_method: { currency?: string };
  payment_method: { type: string; name: string };
  status: string;
  created_at: string;
  currency?: string;
}

async function fetchOrderById(orderId: string): Promise<FetchedOrder | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .maybeSingle();

  if (error || !data) return null;
  return data as FetchedOrder;
}

async function fetchOrderBySessionId(sessionId: string): Promise<FetchedOrder | null> {
  const { data: paymentSession, error: sessionError } = await supabase
    .from('payment_sessions')
    .select('order_id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle();

  if (sessionError || !paymentSession) return null;

  return fetchOrderById(paymentSession.order_id);
}

export default function OrderSuccess() {
  const { t } = useTranslation();
  const location = useLocation();
  const { clearCart } = useCart();
  const { locale, formatPrice } = useLocale();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('order_id');
  const sessionId = params.get('session_id');

  const [fetchedOrder, setFetchedOrder] = useState<FetchedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(!!(orderId || sessionId));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const purchaseTracked = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session?.user);
    });
  }, []);

  useEffect(() => {
    if (!orderId && !sessionId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        let order: FetchedOrder | null = null;
        if (orderId) {
          order = await fetchOrderById(orderId);
        } else if (sessionId) {
          order = await fetchOrderBySessionId(sessionId);
          if (order) clearCart();
        }
        setFetchedOrder(order);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [orderId, sessionId]);

  useEffect(() => {
    if (fetchedOrder && !purchaseTracked.current) {
      purchaseTracked.current = true;
      const currency = fetchedOrder.currency || fetchedOrder.delivery_method?.currency || 'CZK';
      trackPurchase({
        transaction_id: fetchedOrder.id,
        value: fetchedOrder.total / 100,
        currency,
        items: fetchedOrder.items.map(item => ({
          item_name: `${item.name} (${item.variant.length}m)`,
          quantity: item.quantity,
          price: item.variant.price / 100,
        })),
      });
    }
  }, [fetchedOrder]);

  if (!orderId && !sessionId) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO
        title={t('order.success')}
        description={t('order.success_message')}
      />

      <div className="bg-white rounded-lg p-8 shadow-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle className="text-green-500" size={48} />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-3">{t('order.success')}</h1>
        <p className="text-gray-600 mb-8">{t('order.success_message')}</p>

        {fetchedOrder && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <Package size={20} className="text-gray-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-gray-500">{t('order.order_number')}</p>
                <p className="font-mono text-sm font-medium text-gray-800 truncate">{fetchedOrder.id}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
              {fetchedOrder.payment_method.type === 'cash' ? (
                <Banknote size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
              ) : (
                <CreditCard size={20} className="text-gray-500 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-sm text-gray-500">{t('checkout.payment_method')}</p>
                <p className="font-medium text-gray-800">{fetchedOrder.payment_method.name}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {fetchedOrder.payment_method.type === 'cash'
                    ? t('order.pay_on_delivery_message')
                    : t('order.payment_success_message')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">{t('checkout.order_summary')}</h3>
              {fetchedOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start text-sm">
                  <div className="text-gray-700">
                    <span>{item.name}</span>
                    <span className="text-gray-400 ml-1">({item.variant.length}m × {item.quantity})</span>
                  </div>
                  <span className="font-medium text-gray-800 ml-4 flex-shrink-0">
                    {formatPrice(item.variant.price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-semibold">
                <span>{t('checkout.total')}</span>
                <span>{formatPrice(fetchedOrder.total)}</span>
              </div>
            </div>

            {fetchedOrder.customer_info?.email && (
              <p className="text-sm text-gray-500 pt-2 border-t border-gray-200">
                {t('order.confirmation_email_sent')} <span className="font-medium text-gray-700">{fetchedOrder.customer_info.email}</span>
              </p>
            )}
          </div>
        )}

        {!fetchedOrder && sessionId && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
              <CreditCard size={20} />
              <span>{t('order.payment_processed')}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link to={`/${locale}/catalog`} className="btn-primary btn-full flex items-center justify-center gap-2">
            <ShoppingBag size={18} />
            {t('order.continue_shopping')}
          </Link>
          {isAuthenticated && (
            <Link to={`/${locale}/profile`} className="btn-secondary btn-full flex items-center justify-center gap-2">
              <User size={18} />
              {t('profile.my_orders')}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
