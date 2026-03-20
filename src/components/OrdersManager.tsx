import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Filter, ChevronDown, ChevronUp, Package, User, MapPin, CreditCard, Banknote, Truck, CheckCircle, Clock, XCircle, AlertCircle, Eye, CreditCard as Edit3, Save, X, ExternalLink, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  variant: { id: string; length: number; price: number };
  warranty?: { months: number; additionalCost: number };
  image?: string;
}

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

interface Order {
  id: string;
  customer_info: CustomerInfo;
  items: OrderItem[];
  total: number;
  delivery_method: { name?: string; currency?: string };
  payment_method: { type: string; name: string };
  status: string;
  tracking_number: string | null;
  admin_notes: string | null;
  currency: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Ожидает', color: 'yellow', icon: <Clock size={14} /> },
  processing: { label: 'В обработке', color: 'blue', icon: <AlertCircle size={14} /> },
  shipped: { label: 'Отправлен', color: 'cyan', icon: <Truck size={14} /> },
  delivered: { label: 'Доставлен', color: 'green', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Отменён', color: 'red', icon: <XCircle size={14} /> },
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const PAGE_SIZE = 20;

function formatPrice(amount: number, currency = 'CZK') {
  const value = amount / 100;
  if (currency === 'EUR') {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  }
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK' }).format(value);
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Order>) => Promise<void>;
}

function OrderDetailModal({ order, onClose, onUpdate }: OrderDetailModalProps) {
  const [status, setStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currency = order.currency || order.delivery_method?.currency || 'CZK';

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(order.id, {
        status,
        tracking_number: trackingNumber || null,
        admin_notes: adminNotes || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    status !== order.status ||
    trackingNumber !== (order.tracking_number || '') ||
    adminNotes !== (order.admin_notes || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Заказ</h2>
            <p className="text-xs font-mono text-gray-500 mt-0.5">{order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User size={16} className="text-gray-500" />
                  <h3 className="font-semibold text-gray-800 text-sm">Покупатель</h3>
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <p className="font-medium">{order.customer_info.firstName} {order.customer_info.lastName}</p>
                  <p className="text-gray-500">{order.customer_info.email}</p>
                  {order.customer_info.phone && <p className="text-gray-500">{order.customer_info.phone}</p>}
                </div>
              </div>

              {(order.customer_info.address || order.customer_info.city) && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-gray-500" />
                    <h3 className="font-semibold text-gray-800 text-sm">Адрес доставки</h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-700">
                    {order.customer_info.address && <p>{order.customer_info.address}</p>}
                    {(order.customer_info.city || order.customer_info.postalCode) && (
                      <p>{order.customer_info.postalCode} {order.customer_info.city}</p>
                    )}
                    {order.customer_info.country && <p>{order.customer_info.country}</p>}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  {order.payment_method.type === 'cash' ? (
                    <Banknote size={16} className="text-gray-500" />
                  ) : (
                    <CreditCard size={16} className="text-gray-500" />
                  )}
                  <h3 className="font-semibold text-gray-800 text-sm">Оплата</h3>
                </div>
                <p className="text-sm text-gray-700">{order.payment_method.name}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Товары</h3>
                <div className="space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div className="text-gray-700">
                        <span>{item.name}</span>
                        <span className="text-gray-400 ml-1 text-xs">({item.variant.length}m × {item.quantity})</span>
                        {item.warranty && item.warranty.months > 0 && (
                          <span className="ml-1 text-xs text-cyan-600">+{item.warranty.months}m гарантия</span>
                        )}
                      </div>
                      <span className="font-medium text-gray-800 ml-2 flex-shrink-0">
                        {formatPrice(item.variant.price * item.quantity, currency)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-sm">
                    <span>Итого</span>
                    <span>{formatPrice(order.total, currency)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-1">
                <p>Создан: {new Date(order.created_at).toLocaleString('ru-RU')}</p>
                {order.updated_at && order.updated_at !== order.created_at && (
                  <p>Обновлён: {new Date(order.updated_at).toLocaleString('ru-RU')}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 space-y-4">
            <h3 className="font-semibold text-gray-800">Управление заказом</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Статус заказа</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => setStatus(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      status === key
                        ? STATUS_COLORS[key] + ' ring-2 ring-offset-1 ring-current'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Truck size={14} />
                  Трекинг-номер
                </div>
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Например: CZ123456789"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Заметки (внутренние)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Заметки видны только администратору..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            Закрыть
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              saved
                ? 'bg-green-500 text-white'
                : hasChanges
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : saved ? (
              <CheckCircle size={14} />
            ) : (
              <Save size={14} />
            )}
            {saved ? 'Сохранено' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      let filtered = (data as Order[]) || [];
      if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(o => {
          const ci = o.customer_info;
          return (
            o.id.toLowerCase().includes(q) ||
            ci.email?.toLowerCase().includes(q) ||
            ci.firstName?.toLowerCase().includes(q) ||
            ci.lastName?.toLowerCase().includes(q) ||
            o.tracking_number?.toLowerCase().includes(q)
          );
        });
      }

      setOrders(filtered);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdate = async (id: string, updates: Partial<Order>) => {
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
    if (selectedOrder?.id === id) {
      setSelectedOrder(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Поиск по email, имени, ID заказа..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
          >
            <option value="all">Все статусы</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>

          <button
            onClick={loadOrders}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            title="Обновить"
          >
            <RefreshCw size={16} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        {statusFilter === 'all' ? `Всего заказов: ${totalCount}` : `Найдено: ${orders.length}`}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p>Заказов не найдено</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Дата</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Покупатель</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Товары</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Сумма</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Статус</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Трекинг</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const currency = order.currency || order.delivery_method?.currency || 'CZK';
                    return (
                      <React.Fragment key={order.id}>
                        <tr
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === order.id ? null : order.id)}
                        >
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString('ru-RU', {
                              day: '2-digit', month: '2-digit', year: '2-digit'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">
                              {order.customer_info.firstName} {order.customer_info.lastName}
                            </div>
                            <div className="text-gray-400 text-xs truncate max-w-[160px]">
                              {order.customer_info.email}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                            {order.items.map(i => `${i.name} ${i.variant.length}m`).join(', ').substring(0, 40)}
                            {order.items.map(i => `${i.name} ${i.variant.length}m`).join(', ').length > 40 ? '...' : ''}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-800 whitespace-nowrap">
                            {formatPrice(order.total, currency)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            {order.tracking_number ? (
                              <span className="text-xs font-mono text-cyan-600 bg-cyan-50 px-2 py-1 rounded">
                                {order.tracking_number}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                              className="p-1.5 hover:bg-cyan-50 rounded-lg transition-colors text-gray-400 hover:text-cyan-600"
                              title="Открыть"
                            >
                              <Edit3 size={15} />
                            </button>
                          </td>
                        </tr>
                        {expandedRow === order.id && (
                          <tr className="bg-blue-50/30">
                            <td colSpan={7} className="px-4 py-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <span className="text-gray-400 block mb-0.5">ID заказа</span>
                                  <span className="font-mono text-gray-700 break-all">{order.id}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-0.5">Оплата</span>
                                  <span className="text-gray-700">{order.payment_method.name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-400 block mb-0.5">Адрес</span>
                                  <span className="text-gray-700">
                                    {[order.customer_info.address, order.customer_info.city, order.customer_info.country]
                                      .filter(Boolean).join(', ') || '—'}
                                  </span>
                                </div>
                                {order.admin_notes && (
                                  <div>
                                    <span className="text-gray-400 block mb-0.5">Заметки</span>
                                    <span className="text-gray-700">{order.admin_notes}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-500">
                Стр. {page + 1} из {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
