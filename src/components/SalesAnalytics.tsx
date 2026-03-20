import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  TrendingUp, ShoppingBag, Users, DollarSign,
  ArrowUpRight, ArrowDownRight, Calendar, RefreshCw, BarChart2
} from 'lucide-react';

interface Order {
  id: string;
  total: number;
  status: string;
  currency: string | null;
  created_at: string;
  items: Array<{ name: string; quantity: number; variant: { length: number; price: number } }>;
  customer_info: { email: string; firstName: string; lastName: string };
  payment_method: { type: string };
}

interface DayData {
  date: string;
  revenue: number;
  count: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(amount / 100);
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string } | null;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend.value >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-0.5">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
      {trend !== undefined && trend !== null && (
        <div className="text-xs text-gray-400 mt-1">{trend.label}</div>
      )}
    </div>
  );
}

function MiniBarChart({ data, maxVal }: { data: DayData[]; maxVal: number }) {
  if (!data.length || maxVal === 0) return null;
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.map((d, i) => {
        const pct = maxVal > 0 ? (d.revenue / maxVal) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 group relative"
            style={{ minWidth: 0 }}
          >
            <div
              className="w-full bg-cyan-500 rounded-t opacity-80 group-hover:opacity-100 transition-opacity"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {d.date}: {formatCurrency(d.revenue)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function SalesAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, total, status, currency, created_at, items, customer_info, payment_method')
        .order('created_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 9999;
  const cutoff = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

  const filtered = orders.filter(o => period === 'all' || new Date(o.created_at) >= cutoff);
  const active = filtered.filter(o => o.status !== 'cancelled');

  const totalRevenue = active.reduce((s, o) => s + o.total, 0);
  const orderCount = filtered.length;
  const avgOrder = active.length > 0 ? totalRevenue / active.length : 0;

  const uniqueEmails = new Set(filtered.map(o => o.customer_info?.email).filter(Boolean));
  const customerCount = uniqueEmails.size;

  const byStatus: Record<string, number> = {};
  filtered.forEach(o => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });

  const byPayment: Record<string, number> = {};
  filtered.forEach(o => {
    const t = o.payment_method?.type || 'unknown';
    byPayment[t] = (byPayment[t] || 0) + 1;
  });

  const topProducts: Record<string, number> = {};
  active.forEach(o => {
    o.items?.forEach(item => {
      const key = `${item.name} ${item.variant?.length}m`;
      topProducts[key] = (topProducts[key] || 0) + (item.quantity || 1);
    });
  });
  const topProductsSorted = Object.entries(topProducts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxProductCount = topProductsSorted[0]?.[1] || 1;

  const prevCutoff = new Date(cutoff.getTime() - periodDays * 24 * 60 * 60 * 1000);
  const prevOrders = orders.filter(o =>
    period !== 'all' &&
    new Date(o.created_at) >= prevCutoff &&
    new Date(o.created_at) < cutoff &&
    o.status !== 'cancelled'
  );
  const prevRevenue = prevOrders.reduce((s, o) => s + o.total, 0);
  const revTrend = prevRevenue > 0
    ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
    : null;
  const prevCount = orders.filter(o =>
    period !== 'all' &&
    new Date(o.created_at) >= prevCutoff &&
    new Date(o.created_at) < cutoff
  ).length;
  const countTrend = prevCount > 0
    ? Math.round(((orderCount - prevCount) / prevCount) * 100)
    : null;

  const chartDays = Math.min(periodDays === 9999 ? 30 : periodDays, 30);
  const dayMap: Record<string, DayData> = {};
  for (let i = chartDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    dayMap[key] = { date: key, revenue: 0, count: 0 };
  }
  active.forEach(o => {
    const d = new Date(o.created_at);
    const key = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    if (dayMap[key]) {
      dayMap[key].revenue += o.total;
      dayMap[key].count += 1;
    }
  });
  const chartData = Object.values(dayMap);
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Ожидает',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  };
  const STATUS_COLORS_CHART: Record<string, string> = {
    pending: 'bg-yellow-400',
    processing: 'bg-blue-400',
    shipped: 'bg-cyan-400',
    delivered: 'bg-green-400',
    cancelled: 'bg-red-400',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {(['7d', '30d', '90d', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === 'all' ? 'Всё время' : p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : '90 дней'}
            </button>
          ))}
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw size={14} />
          Обновить
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Выручка"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign size={18} className="text-green-600" />}
          color="bg-green-50"
          trend={revTrend !== null ? { value: revTrend, label: 'vs предыдущий период' } : null}
        />
        <StatCard
          title="Заказов"
          value={String(orderCount)}
          icon={<ShoppingBag size={18} className="text-blue-600" />}
          color="bg-blue-50"
          trend={countTrend !== null ? { value: countTrend, label: 'vs предыдущий период' } : null}
        />
        <StatCard
          title="Средний чек"
          value={active.length > 0 ? formatCurrency(avgOrder) : '—'}
          icon={<TrendingUp size={18} className="text-cyan-600" />}
          color="bg-cyan-50"
          trend={null}
        />
        <StatCard
          title="Уникальных клиентов"
          value={String(customerCount)}
          icon={<Users size={18} className="text-orange-600" />}
          color="bg-orange-50"
          trend={null}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-gray-500" />
            <h3 className="font-semibold text-gray-800">Выручка по дням</h3>
          </div>
          {chartData.every(d => d.revenue === 0) ? (
            <div className="flex items-center justify-center h-16 text-gray-300 text-sm">
              Нет данных за период
            </div>
          ) : (
            <MiniBarChart data={chartData} maxVal={maxRevenue} />
          )}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>{chartData[0]?.date}</span>
            <span>{chartData[chartData.length - 1]?.date}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Заказы по статусам</h3>
          <div className="space-y-2.5">
            {Object.entries(byStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_COLORS_CHART[status] || 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm text-gray-700">{STATUS_LABELS[status] || status}</span>
                    <span className="text-sm font-semibold text-gray-800">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STATUS_COLORS_CHART[status] || 'bg-gray-300'}`}
                      style={{ width: `${(count / orderCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(byStatus).length === 0 && (
              <p className="text-sm text-gray-400">Нет данных</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Топ продукты</h3>
          {topProductsSorted.length === 0 ? (
            <p className="text-sm text-gray-400">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {topProductsSorted.map(([name, count], i) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-sm text-gray-700 truncate">{name}</span>
                      <span className="text-sm font-semibold text-gray-800 ml-2 flex-shrink-0">{count} шт</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${(count / maxProductCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Способы оплаты</h3>
          <div className="space-y-3">
            {Object.entries(byPayment).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-gray-400" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm text-gray-700 capitalize">
                      {type === 'cash' ? 'Наложенный платёж' : type === 'card' ? 'Карта (Stripe)' : type}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {count} ({Math.round((count / orderCount) * 100)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full"
                      style={{ width: `${(count / orderCount) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(byPayment).length === 0 && (
              <p className="text-sm text-gray-400">Нет данных</p>
            )}
          </div>
        </div>
      </div>

      {period !== 'all' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Последние заказы</h3>
          <div className="space-y-2">
            {filtered.slice(0, 8).map(order => {
              const currency = order.currency || 'CZK';
              return (
                <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-400' :
                      order.status === 'shipped' ? 'bg-cyan-400' :
                      order.status === 'cancelled' ? 'bg-red-400' : 'bg-yellow-400'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {order.customer_info?.firstName} {order.customer_info?.lastName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-gray-400">{STATUS_LABELS[order.status] || order.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
