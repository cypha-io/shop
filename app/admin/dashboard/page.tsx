'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiShoppingCart, FiTrendingUp, FiClock, FiAlertCircle, FiBell, FiToggleRight, FiAward, FiPrinter, FiX, FiUsers } from 'react-icons/fi';

interface Order {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'dispatched';
  time: string;
}

export default function DashboardPage() {
  const [pauseOrdering, setPauseOrdering] = useState(false);
  const [markBusy, setMarkBusy] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const alerts = [
    { id: '1', type: 'stock', message: 'Low stock: Mozzarella Cheese (5kg left)', severity: 'critical' },
    { id: '2', type: 'payment', message: 'Payment failed for order #1002 - Retry needed', severity: 'error' },
    { id: '3', type: 'delivery', message: '2 deliveries delayed by 15+ minutes', severity: 'warning' },
    { id: '4', type: 'cancellation', message: 'High cancellation rate (12%) - Garlic Bread', severity: 'warning' },
  ];

  const kpis = [
    { label: 'Today\'s Orders', value: '156', change: '+12%', icon: FiShoppingCart, color: 'from-blue-500 to-cyan-500' },
    { label: 'Today\'s Revenue', value: '₵42,340', change: '+18%', icon: FiTrendingUp, color: 'from-green-500 to-emerald-500' },
    { label: 'Avg Prep Time', value: '12 mins', change: '-2 mins', icon: FiClock, color: 'from-orange-500 to-red-500' },
    { label: 'Active Customers', value: '248', change: '+8%', icon: FiUsers, color: 'from-purple-500 to-pink-500' },
  ];

  const statusColors = {
    new: 'bg-blue-100 text-blue-800 border-blue-300',
    preparing: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    ready: 'bg-green-100 text-green-800 border-green-300',
    dispatched: 'bg-purple-100 text-purple-800 border-purple-300',
  };

  const filteredAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  const liveOrders: Order[] = [
    { id: '#1005', customer: 'Kwesi Boateng', items: 2, total: 54.90, status: 'new', time: '2 mins ago' },
    { id: '#1004', customer: 'Abena Osei', items: 3, total: 89.90, status: 'preparing', time: '8 mins ago' },
    { id: '#1003', customer: 'Yaw Mensah', items: 1, total: 39.90, status: 'ready', time: '12 mins ago' },
    { id: '#1002', customer: 'Nadia Sarfo', items: 4, total: 124.90, status: 'dispatched', time: '25 mins ago' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8 pb-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-600 font-medium text-sm">{kpi.label}</h3>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${kpi.color} text-white shadow-md`}>
                    <Icon size={24} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                  <p className={`text-sm font-semibold ${kpi.change.startsWith('+') || kpi.change.startsWith('-') && kpi.change.includes('min') ? 'text-green-600' : 'text-blue-600'}`}>
                    {kpi.change} from yesterday
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setPauseOrdering(!pauseOrdering)}
                className={`flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-200 font-medium ${
                  pauseOrdering
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="p-2 bg-white/20 rounded-lg">
                  <FiToggleRight size={20} />
                </div>
                <span>Pause Ordering</span>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  pauseOrdering ? 'bg-white border-white' : 'border-current'
                }`}>
                  {pauseOrdering && <div className="w-2 h-2 rounded-full bg-red-600"></div>}
                </div>
              </button>
              <button
                onClick={() => setMarkBusy(!markBusy)}
                className={`flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-200 font-medium ${
                  markBusy
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="p-2 bg-white/20 rounded-lg">
                  <FiBell size={20} />
                </div>
                <span>Mark Store Busy</span>
                <div className={`ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  markBusy ? 'bg-white border-white' : 'border-current'
                }`}>
                  {markBusy && <div className="w-2 h-2 rounded-full bg-yellow-600"></div>}
                </div>
              </button>
              <button
                onClick={() => setShowBannerModal(true)}
                className="flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-200 font-medium bg-gray-100 text-gray-700 border border-gray-300 hover:shadow-md"
              >
                <div className="p-2 rounded-lg">
                  <FiAward size={20} className="text-purple-600" />
                </div>
                <span>Create Banner</span>
              </button>
              <button className="flex items-center gap-4 px-6 py-4 rounded-lg transition-all duration-200 font-medium bg-gray-100 text-gray-700 border border-gray-300 hover:shadow-md">
                <div className="p-2 rounded-lg">
                  <FiPrinter size={20} className="text-blue-600" />
                </div>
                <span>Print Tickets</span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-h-72 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">System Alerts</h2>
            <div className="space-y-3">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 hover:shadow-sm transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">⚠️</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{alert.message}</p>
                        <p className="text-xs text-gray-600 mt-1">Severity: <span className={`font-semibold ${alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'error' ? 'text-orange-600' : 'text-yellow-600'}`}>{alert.severity}</span></p>
                      </div>
                      <button
                        onClick={() => setDismissedAlerts([...dismissedAlerts, alert.id])}
                        className="p-1 rounded hover:bg-yellow-200 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <FiX size={16} className="text-gray-500" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">All systems operational ✓</p>
              )}
            </div>
          </div>
        </div>

        {/* Live Order Feed */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Live Order Feed</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              Live
            </div>
          </div>
          <div className="space-y-3">
            {liveOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-lg border border-gray-200 hover:shadow-md hover:border-red-200 transition-all duration-200 hover:bg-red-50/30 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{order.id}</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${statusColors[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">{order.time}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                    <p className="text-sm text-gray-600 mt-1">{order.items} items</p>
                  </div>
                  <div className="text-right ml-4 flex flex-col items-end gap-2">
                    <p className="font-bold text-red-600 text-lg">₵{order.total}</p>
                    <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 hover:shadow-md transition-all duration-200 opacity-0 group-hover:opacity-100">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Banner</h2>
              <button
                onClick={() => setShowBannerModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX size={20} className="text-gray-600" />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <input
                type="text"
                placeholder="Banner Title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <textarea
                placeholder="Banner Message"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              ></textarea>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBannerModal(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 hover:shadow-md transition-all duration-200">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
