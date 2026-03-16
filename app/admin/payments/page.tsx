'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiCheck, FiX } from 'react-icons/fi';

interface Payment {
  id: string;
  orderId: string;
  customer: string;
  amount: number;
  method: 'card' | 'momo' | 'cash' | 'wallet';
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface Refund {
  id: string;
  orderId: string;
  customer: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('transactions');

  const [payments] = useState<Payment[]>([
    { id: 'PAY001', orderId: '#1001', customer: 'Kwesi Boateng', amount: 134.70, method: 'card', status: 'completed', date: '2024-01-16 14:30' },
    { id: 'PAY002', orderId: '#1002', customer: 'Abena Osei', amount: 54.90, method: 'momo', status: 'pending', date: '2024-01-16 14:45' },
    { id: 'PAY003', orderId: '#1003', customer: 'Yaw Mensah', amount: 54.80, method: 'cash', status: 'failed', date: '2024-01-16 15:00' },
  ]);

  const [refunds] = useState<Refund[]>([
    { id: 'REF001', orderId: '#995', customer: 'Nadia Sarfo', reason: 'Order not received', amount: 59.90, status: 'approved', date: '2024-01-15' },
    { id: 'REF002', orderId: '#998', customer: 'Ekua Adjei', reason: 'Wrong item delivered', amount: 89.90, status: 'pending', date: '2024-01-16' },
  ]);

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const methodColors = {
    card: 'bg-blue-100 text-blue-800',
    momo: 'bg-purple-100 text-purple-800',
    cash: 'bg-gray-100 text-gray-800',
    wallet: 'bg-orange-100 text-orange-800',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Payments & Finance</h1>

        <div className="flex gap-0 border-b border-gray-200">
          {[
            { id: 'transactions', label: 'Transactions' },
            { id: 'refunds', label: 'Refunds' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id ? 'border-red-600 text-red-600 bg-red-50' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Payment ID</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Order</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Method</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{payment.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.orderId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.customer}</td>
                    <td className="px-6 py-4 text-sm font-semibold">₵{payment.amount}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${methodColors[payment.method]}`}>
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[payment.status]}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'refunds' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Refund ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {refunds.map(refund => (
                  <tr key={refund.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{refund.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{refund.orderId}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{refund.customer}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{refund.reason}</td>
                    <td className="px-6 py-4 text-sm font-semibold">₵{refund.amount}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[refund.status]}`}>
                        {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {refund.status === 'pending' && (
                        <>
                          <button className="text-green-500 hover:text-green-700"><FiCheck /></button>
                          <button className="text-red-500 hover:text-red-700"><FiX /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
