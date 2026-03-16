'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  minLevel: number;
  supplier: string;
  lastRestocked: string;
  status: 'optimal' | 'low' | 'critical';
}

export default function InventoryPage() {
  const [inventory] = useState<InventoryItem[]>([
    { id: 1, name: 'All-purpose Flour', quantity: 150, unit: 'kg', minLevel: 50, supplier: 'Best Foods Inc', lastRestocked: '2024-01-14', status: 'optimal' },
    { id: 2, name: 'Mozzarella Cheese', quantity: 25, unit: 'kg', minLevel: 20, supplier: 'Dairy Ltd', lastRestocked: '2024-01-15', status: 'low' },
    { id: 3, name: 'Pepperoni', quantity: 5, unit: 'kg', minLevel: 10, supplier: 'Meat Supplies', lastRestocked: '2024-01-10', status: 'critical' },
    { id: 4, name: 'Pizza Boxes', quantity: 200, unit: 'units', minLevel: 100, supplier: 'Packaging Co', lastRestocked: '2024-01-12', status: 'optimal' },
  ]);

  const statusColors = {
    optimal: 'bg-green-100 text-green-800',
    low: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600">
            <FiPlus /> Add Item
          </button>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <FiAlertTriangle className="text-red-600 text-xl mt-1" />
          <div>
            <p className="font-semibold text-red-900">Low Stock Alert</p>
            <p className="text-sm text-red-700">2 items at critical stock levels</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Item</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Min Level</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Supplier</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Last Restocked</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.minLevel} {item.unit}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.supplier}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.lastRestocked}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[item.status]}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm flex gap-2">
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
