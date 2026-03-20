import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';
import { useLocale } from '../context/LocaleContext';
import {
  Search, Package, Truck, CheckCircle, Clock, XCircle,
  AlertCircle, MapPin, CreditCard, Banknote, ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  variant: { length: number; price: number };
  warranty?: { months: number; additionalCost: number };
}

interface Order {
  id: string;
  status: string;
  tracking_number: string | null;
  total: number;
  currency: string | null;
  created_at: string;
  updated_at: string | null;
  items: OrderItem[];
  customer_info: {
    email: string;
    firstName: string;
    lastName: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  delivery_method: { name?: string; currency?: string };
  payment_method: { type: string; name: string };
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Заказ принят', icon: Clock, description: 'Мы получили ваш заказ и проверяем наличие товара' },
  { key: 'processing', label: 'В обработке', icon: AlertCircle, description: 'Заказ комплектуется и готовится к отправке' },
  { key: 'shipped', label: 'Отправлен', icon: Truck, description: 'Посылка передана в службу доставки' },
  { key: 'delivered', label: 'Доставлен', icon: CheckCircle, description: 'Заказ успешно доставлен' },
];

const STATUS_ORDER = ['pending', 'processing', 'shipped', 'delivered'];

function formatCurrency(amount: number, currency = 'CZK') {
  if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount / 100);
  }
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(amount / 100);
}

function OrderStatusTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
        <XCircle size={24} className="text-red-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-red-800">Заказ отменён</p>
          <p className="text-sm text-red-600 mt-0.5">Пожалуйста, свяжитесь с нами если у вас есть вопросы</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="space-y-0">
      {STATUS_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isDone = i <= currentIndex;
        const isCurrent = i === currentIndex;

        return (
          <div key={step.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                isDone
                  ? isCurrent
                    ? 'bg-cyan-500 text-white ring-4 ring-cyan-100'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <Icon size={18} />
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`w-0.5 h-8 mt-1 ${isDone && i < currentIndex ? 'bg-green-400' : 'bg-gray-100'}`} />
              )}
            </div>
            <div className="pb-6 pt-1.5">
              <p className={`font-semibold text-sm ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderTracking() {
  const { locale } = useLocale();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [orderId, setOrderId] = useState(params.get('order_id') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (params.get('order_id') && params.get('email')) {
      handleAutoSearch(params.get('order_id')!, params.get('email')!);
    }
  }, []);

  const handleAutoSearch = async (id: string, em: string) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const { data, error: dbError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id.trim())
        .maybeSingle();
      if (dbError) throw dbError;
      if (!data) { setError('Заказ не найден.'); return; }
      const orderData = data as Order;
      if (orderData.customer_info?.email?.toLowerCase() !== em.trim().toLowerCase()) {
        setError('Заказ не найден.');
        return;
      }
      setOrder(orderData);
    } catch (e) {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);
    setSearched(true);

    try {
      const { data, error: dbError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId.trim())
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError('Заказ не найден. Проверьте номер заказа и email.');
        return;
      }

      const orderData = data as Order;
      const orderEmail = orderData.customer_info?.email?.toLowerCase();
      if (orderEmail !== email.trim().toLowerCase()) {
        setError('Заказ не найден. Проверьте номер заказа и email.');
        return;
      }

      setOrder(orderData);
    } catch (e) {
      console.error(e);
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const currency = order?.currency || order?.delivery_method?.currency || 'CZK';

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Отслеживание заказа | LED Lighting"
        description="Проверьте статус вашего заказа по номеру и email адресу"
      />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-50 rounded-2xl mb-4">
            <Package size={28} className="text-cyan-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Отслеживание заказа</h1>
          <p className="text-gray-500">Введите номер заказа и email для проверки статуса</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Номер заказа</label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Номер заказа был отправлен на ваш email</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search size={18} />
                  Найти заказ
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-sm text-red-700">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Заказ</p>
                  <p className="font-mono text-xs text-gray-600 break-all">{order.id}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    от {new Date(order.created_at).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(order.total, currency)}</p>
                  <p className="text-xs text-gray-400">{order.items?.length} товар(а)</p>
                </div>
              </div>

              <OrderStatusTimeline status={order.status} />

              {order.tracking_number && (
                <div className="mt-4 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck size={16} className="text-cyan-600" />
                    <span className="text-sm font-semibold text-cyan-800">Трекинг-номер</span>
                  </div>
                  <p className="font-mono text-sm text-cyan-700 font-medium">{order.tracking_number}</p>
                  <p className="text-xs text-cyan-600 mt-1">Используйте этот номер на сайте службы доставки</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Состав заказа</h3>
              <div className="space-y-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-400 text-xs">{item.variant?.length}m × {item.quantity} шт</p>
                      {item.warranty && item.warranty.months > 0 && (
                        <p className="text-cyan-600 text-xs">+ Гарантия {item.warranty.months} мес.</p>
                      )}
                    </div>
                    <span className="font-semibold text-gray-800 ml-4 flex-shrink-0">
                      {formatCurrency(item.variant?.price * item.quantity, currency)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-3 border-t border-gray-100 font-bold">
                  <span>Итого</span>
                  <span>{formatCurrency(order.total, currency)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Детали доставки</h3>
              <div className="space-y-3 text-sm">
                {(order.customer_info.address || order.customer_info.city) && (
                  <div className="flex gap-3">
                    <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-gray-700">
                      {order.customer_info.address && <p>{order.customer_info.address}</p>}
                      {(order.customer_info.postalCode || order.customer_info.city) && (
                        <p>{order.customer_info.postalCode} {order.customer_info.city}</p>
                      )}
                      {order.customer_info.country && <p>{order.customer_info.country}</p>}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  {order.payment_method?.type === 'cash' ? (
                    <Banknote size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CreditCard size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-gray-700">{order.payment_method?.name}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Link
                to={`/${locale}/support`}
                className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
              >
                Нужна помощь? Свяжитесь с нами
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {!order && !error && !searched && (
          <div className="text-center text-sm text-gray-400">
            <p>Номер заказа был отправлен на ваш email после оформления</p>
          </div>
        )}
      </div>
    </div>
  );
}
