'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiSearch, FiChevronDown, FiEdit2, FiTrash2, FiEye, FiPrinter, FiMessageSquare, FiX } from 'react-icons/fi';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
}

interface Order {
  id: string;
  customer: string;
  phone: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'accepted' | 'inKitchen' | 'ready' | 'dispatched' | 'completed';
  paymentStatus: 'pending' | 'completed' | 'failed';
  deliveryType: 'delivery' | 'pickup';
  timeline: { status: string; time: string }[];
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders: Order[] = [
    {
      id: '#1001',
      customer: 'John Doe',
      phone: '+91-9876543210',
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 34.90, modifiers: ['Large', 'Extra Cheese'] },
        { name: 'Garlic Bread', quantity: 2, price: 14.90 },
      ],
      total: 134.70,
      status: 'completed',
      paymentStatus: 'completed',
      deliveryType: 'delivery',
      timeline: [
        { status: 'Order Received', time: '2:30 PM' },
        { status: 'In Kitchen', time: '2:35 PM' },
        { status: 'Ready', time: '2:50 PM' },
        { status: 'Out for Delivery', time: '3:00 PM' },
        { status: 'Delivered', time: '3:25 PM' },
      ],
    },
    {
      id: '#1002',
      customer: 'Jane Smith',
      phone: '+91-8765432109',
      items: [
        { name: 'Pepperoni Pizza', quantity: 1, price: 39.90, modifiers: ['Large'] },
      ],
      total: 54.90,
      status: 'inKitchen',
      paymentStatus: 'pending',
      deliveryType: 'delivery',
      timeline: [
        { status: 'Order Received', time: '2:45 PM' },
        { status: 'In Kitchen', time: '2:48 PM' },
      ],
    },
    {
      id: '#1003',
      customer: 'Mike Johnson',
      phone: '+91-7654321098',
      items: [
        { name: 'Chicken Pizza', quantity: 2, price: 44.90, modifiers: ['Medium'] },
      ],
      total: 54.80,
      status: 'ready',
      paymentStatus: 'completed',
      deliveryType: 'pickup',
      timeline: [
        { status: 'Order Received', time: '3:00 PM' },
        { status: 'In Kitchen', time: '3:05 PM' },
        { status: 'Ready', time: '3:20 PM' },
      ],
    },
  ];

  const statusColors = {
    new: 'bg-blue-100/80 text-blue-800 border-blue-300',
    accepted: 'bg-purple-100/80 text-purple-800 border-purple-300',
    inKitchen: 'bg-yellow-100/80 text-yellow-800 border-yellow-300',
    ready: 'bg-green-100/80 text-green-800 border-green-300',
    dispatched: 'bg-orange-100/80 text-orange-800 border-orange-300',
    completed: 'bg-gray-100/80 text-gray-800 border-gray-300',
  };

  const paymentColors = {
    pending: 'bg-yellow-100/80 text-yellow-800 border-yellow-300',
    completed: 'bg-green-100/80 text-green-800 border-green-300',
    failed: 'bg-red-100/80 text-red-800 border-red-300',
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>

        {selectedOrder ? (
          // Detail View
          <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Order {selectedOrder.id}</h2>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors hover:scale-110"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200/50">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">👤 Customer Info</h3>
                <p className="text-sm text-gray-600 mb-2"><span className="font-medium">Name:</span> {selectedOrder.customer}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {selectedOrder.phone}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">📦 Order Status</h3>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold border ${statusColors[selectedOrder.status]} inline-block`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className="mb-6 pb-6 border-b border-gray-200/50">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">🛒 Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Qty: {item.quantity}</span>
                        {item.modifiers && item.modifiers.map((mod, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">{mod}</span>
                        ))}
                      </div>
                    </div>
                    <p className="font-bold text-red-600">₵{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200/50">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Amount:</span>
                <span className="text-red-600">₵{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 hover:shadow-md transition-colors font-semibold flex items-center justify-center gap-2">
                <FiPrinter /> Print Ticket
              </button>
              <button className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 hover:shadow-md transition-colors font-semibold flex items-center justify-center gap-2">
                <FiMessageSquare /> Send SMS
              </button>
              <button className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 hover:shadow-md transition-colors font-semibold">
                Cancel Order
              </button>
            </div>
          </div>
        ) : (
          // List View
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-4">
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-xs flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3 focus-within:border-red-500 bg-white">
                  <FiSearch className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by order ID or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 outline-none bg-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="accepted">Accepted</option>
                  <option value="inKitchen">In Kitchen</option>
                  <option value="ready">Ready</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 font-medium"
                >
                  <option value="all">All Payment</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-red-50 transition-colors duration-200 group">
                      <td className="px-6 py-4 font-bold text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{order.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{order.items.length} items</td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600">₵{order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${paymentColors[order.paymentStatus]}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700 capitalize">{order.deliveryType}</td>
                      <td className="px-6 py-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          onClick={() => setSelectedOrder(order)} 
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 transition-all"
                        >
                          <FiEye size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-110 transition-all">
                          <FiEdit2 size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
