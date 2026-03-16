'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiDownload } from 'react-icons/fi';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  orders: number;
  spent: number;
  lastOrder: string;
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const [customers] = useState<Customer[]>([
    { id: 1, name: 'Kwesi Boateng', phone: '+233-24-1234567', email: 'kwesi@email.com', orders: 15, spent: 1245.00, lastOrder: '2024-01-14' },
    { id: 2, name: 'Abena Osei', phone: '+233-55-2345678', email: 'abena@email.com', orders: 8, spent: 542.00, lastOrder: '2024-01-15' },
    { id: 3, name: 'Yaw Mensah', phone: '+233-50-3456789', email: 'yaw@email.com', orders: 22, spent: 1890.00, lastOrder: '2024-01-16' },
  ]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600">
            <FiDownload /> Export List
          </button>
        </div>

        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-red-500 transition-all duration-200">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Orders</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Spent</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Last Order</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{customer.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.email}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{customer.orders}</td>
                  <td className="px-6 py-4 text-sm font-semibold">₵{customer.spent}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.lastOrder}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700"><FiEdit2 /></button>
                    <button className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
