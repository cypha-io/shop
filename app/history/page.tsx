'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FiClock, FiCheckCircle, FiXCircle, FiSearch, FiFilter } from 'react-icons/fi';

export default function HistoryPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Delivered' | 'Cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const orders = [
    { id: '#12345', date: '2026-02-10', items: 'Pepperoni Pizza, Fried Chicken', total: 'GH₵125', status: 'Delivered' },
    { id: '#12344', date: '2026-02-08', items: 'BBQ Wings, French Fries', total: 'GH₵75', status: 'Delivered' },
    { id: '#12343', date: '2026-02-05', items: 'Family Package', total: 'GH₵160', status: 'Cancelled' },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.toLowerCase().includes(searchQuery.toLowerCase());
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
                className="pl-9 pr-4 py-2.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-700 focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-2">
              <FiFilter className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'Delivered' | 'Cancelled')}
                className="text-sm font-semibold text-gray-700 focus:outline-none bg-transparent"
              >
                <option value="all">All</option>
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
                <p className="text-2xl font-black text-gray-900">{orders.filter(order => order.status === 'Delivered').length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <FiCheckCircle size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold">Cancelled</p>
                <p className="text-2xl font-black text-gray-900">{orders.filter(order => order.status === 'Cancelled').length}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <FiXCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-gray-500">Order</span>
                    <span className="text-lg font-black text-gray-900">{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{order.date}</p>
                  <p className="text-gray-800 font-medium">{order.items}</p>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-3">
                  <p className="font-black text-2xl text-red-600">{order.total}</p>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-gray-800">
                      Reorder
                    </button>
                    <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
