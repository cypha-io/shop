'use client';

import { useEffect, useMemo, useState } from 'react';

type OrderStatus = 'Pending' | 'Delivered' | 'Cancelled';

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  paymentCompleted?: boolean;
  total: number;
  createdAt: string;
};

type SaveMap = Record<number, boolean>;
type Toast = {
  type: 'success' | 'error';
  message: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [originalStatuses, setOriginalStatuses] = useState<Record<number, OrderStatus>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [saving, setSaving] = useState<SaveMap>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load orders');
        const payload = (await response.json()) as Order[];
        setOrders(payload);

        const statusMap: Record<number, OrderStatus> = {};
        for (const order of payload) {
          statusMap[order.id] = order.status;
        }
        setOriginalStatuses(statusMap);
      } catch (err) {
        setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load orders' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const deliveredCount = useMemo(() => orders.filter(order => order.status === 'Delivered').length, [orders]);

  const setRowStatus = (id: number, status: OrderStatus) => {
    setOrders(prev => prev.map(order => (order.id === id ? { ...order, status } : order)));
  };

  const saveStatus = async (order: Order) => {
    try {
      setSaving(prev => ({ ...prev, [order.id]: true }));

      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: order.status }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Failed to update order status');
      }

      setOriginalStatuses(prev => ({ ...prev, [order.id]: order.status }));
      setToast({ type: 'success', message: `Order ${order.orderNumber} updated.` });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update order status' });
    } finally {
      setSaving(prev => ({ ...prev, [order.id]: false }));
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <section className="mx-auto w-full max-w-7xl">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-pink-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-3xl font-black text-slate-900">Orders</h1>
        <p className="mt-1 text-sm text-slate-600">Track orders and update their status.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{orders.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Delivered</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{deliveredCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pending</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{orders.filter(order => order.status === 'Pending').length}</p>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          {loading ? (
            <div className="p-5 text-slate-600">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-5 text-slate-600">No orders found.</div>
          ) : (
            <table className="w-full min-w-[860px] bg-white">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t border-slate-100 text-sm">
                    <td className="px-4 py-3 font-bold text-slate-900">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{order.customerName}</td>
                    <td className="px-4 py-3 text-slate-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          order.paymentCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.paymentCompleted ? 'Completed' : 'Not Completed'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={event => setRowStatus(order.id, event.target.value as OrderStatus)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">GH₵{Number(order.total).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void saveStatus(order)}
                        disabled={saving[order.id] || originalStatuses[order.id] === order.status}
                        className="rounded-lg bg-pink-600 px-3 py-2 text-xs font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
                      >
                        {saving[order.id] ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
