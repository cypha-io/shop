'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiClock, FiCheckCircle, FiXCircle, FiSearch, FiFilter } from 'react-icons/fi';

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  lineTotal: number;
};

type Order = {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  total: number;
  items: OrderItem[];
};

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Delivered' | 'Cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const storedPhone = window.localStorage.getItem('wf-user-phone')?.trim() || '';
        const endpoint = storedPhone
          ? `/api/orders?phone=${encodeURIComponent(storedPhone)}`
          : '/api/orders';
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as Order[];
        setOrders(data);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const deliveredCount = useMemo(
    () => orders.filter(order => order.status === 'Delivered').length,
    [orders]
  );

  const pendingCount = useMemo(
    () => orders.filter(order => order.status === 'Pending').length,
    [orders]
  );

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const itemNames = order.items.map(item => item.productName).join(', ');
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemNames.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Order History</h1>
            <p className="text-gray-600 mt-2">Track, repeat, and manage your previous orders.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order or items"
                className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-2">
              <FiFilter className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Pending' | 'Delivered' | 'Cancelled')}
                className="text-sm font-semibold text-gray-700 focus:outline-none bg-transparent"
              >
                <option value="all">All</option>
                <option value="Pending">Pending</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Total Orders</p>
                <p className="text-2xl font-black text-gray-900">{orders.length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <FiClock size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Delivered</p>
                <p className="text-2xl font-black text-gray-900">{deliveredCount}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <FiCheckCircle size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Pending</p>
                <p className="text-2xl font-black text-gray-900">{pendingCount}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <FiXCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-orange-600">Failed to load orders: {error}</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading orders...</p>
          </div>
        )}

        <div className="space-y-4">
          {!loading && filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-gray-500">Order</span>
                    <span className="text-lg font-black text-gray-900">{order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'Cancelled'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-800 font-medium">
                    {order.items.map(item => `${item.productName} x${item.quantity}`).join(', ')}
                  </p>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-3">
                  <p className="font-black text-2xl text-orange-500">GH₵{Number(order.total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}

          {!loading && filteredOrders.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <p className="text-gray-600">No orders found.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
