'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FiDollarSign, FiPackage, FiShoppingBag, FiClock } from 'react-icons/fi';

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  lineTotal: number;
};

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  total: number;
  createdAt: string;
  items: OrderItem[];
};

type Product = { id: number };

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ordersRes, productsRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
        ]);

        if (!ordersRes.ok || !productsRes.ok) {
          throw new Error('Failed to load dashboard data');
        }

        const ordersData = (await ordersRes.json()) as Order[];
        const productsData = (await productsRes.json()) as Product[];

        setOrders(ordersData);
        setProducts(productsData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalRevenue = useMemo(
    () => orders.filter(o => o.status !== 'Cancelled').reduce((sum, order) => sum + Number(order.total || 0), 0),
    [orders]
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'Pending').length;

  const recentOrders = orders.slice(0, 8);

  return (
    <section className="mx-auto w-full max-w-7xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor sales, orders, and catalog performance.</p>
          </div>
          <Link href="/admin/orders" className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600">
            View Full Orders
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-600">{error}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Revenue</p>
                <p className="text-2xl font-black text-gray-900">GH₵{totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <FiDollarSign />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Total Orders</p>
                <p className="text-2xl font-black text-gray-900">{totalOrders}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiShoppingBag />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Pending</p>
                <p className="text-2xl font-black text-gray-900">{pendingOrders}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <FiClock />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500">Products</p>
                <p className="text-2xl font-black text-gray-900">{products.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <FiPackage />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900">Recent Orders</h2>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-gray-600">Loading dashboard...</div>
          ) : recentOrders.length === 0 ? (
            <div className="px-5 py-10 text-gray-600">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-t border-gray-100 text-sm">
                      <td className="px-5 py-3 font-bold text-gray-900">{order.orderNumber}</td>
                      <td className="px-5 py-3 text-gray-700">{order.customerName}</td>
                      <td className="px-5 py-3 text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          order.status === 'Delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Cancelled'
                              ? 'bg-orange-50 text-orange-600'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold text-orange-500">GH₵{Number(order.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/admin/products" className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-black">
            Manage Catalog
          </Link>
          <Link href="/admin/orders" className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200">
            Manage Orders
          </Link>
        </div>
      </div>
    </section>
  );
}
