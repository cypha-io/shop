'use client';

import { useEffect, useMemo, useState } from 'react';

type Order = {
  id: number;
  total: number;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  createdAt: string;
};

type Product = {
  id: number;
  category: string;
};

export default function AdminAnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders', { cache: 'no-store' }),
          fetch('/api/products', { cache: 'no-store' }),
        ]);

        if (!ordersRes.ok || !productsRes.ok) throw new Error('Failed to load analytics data');

        const ordersPayload = (await ordersRes.json()) as Order[];
        const productsPayload = (await productsRes.json()) as Product[];

        setOrders(ordersPayload);
        setProducts(productsPayload);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const revenue = useMemo(
    () => orders.filter(order => order.status !== 'Cancelled').reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const averageOrderValue = useMemo(() => {
    if (!orders.length) return 0;
    return revenue / orders.length;
  }, [orders, revenue]);

  const categoryCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const product of products) {
      map.set(product.category, (map.get(product.category) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [products]);

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h1 className="text-3xl font-black text-slate-900">Analytics</h1>
        <p className="mt-1 text-sm text-slate-600">Business trends and performance metrics.</p>

        {error && <p className="mt-5 rounded-lg bg-pink-50 p-3 text-sm font-semibold text-pink-700">{error}</p>}

        {loading ? (
          <div className="mt-6 text-slate-600">Loading analytics...</div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Revenue</p>
                <p className="mt-2 text-2xl font-black text-slate-900">GH₵{revenue.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Orders</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{orders.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Avg Order Value</p>
                <p className="mt-2 text-2xl font-black text-slate-900">GH₵{averageOrderValue.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categories</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{categoryCount.length}</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">Top Categories</h2>
              </div>
              <div className="p-4">
                {categoryCount.length === 0 ? (
                  <p className="text-sm text-slate-600">No categories yet.</p>
                ) : (
                  <div className="space-y-3">
                    {categoryCount.map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                        <p className="font-semibold text-slate-800">{category}</p>
                        <p className="text-sm font-bold text-slate-600">{count} item{count === 1 ? '' : 's'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
