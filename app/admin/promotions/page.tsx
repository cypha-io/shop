'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

interface PromoCode {
  id: string;
  code: string;
  discount: string;
  type: 'percentage' | 'fixed';
  expiry: string;
  usage: { used: number; limit: number };
  status: 'active' | 'expired' | 'paused';
}

interface Deal {
  id: number;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

interface Banner {
  id: number;
  title: string;
  message: string;
  status: 'active' | 'scheduled' | 'expired';
}

export default function PromotionsPage() {
  const [activeTab, setActiveTab] = useState('codes');
  const [showModal, setShowModal] = useState(false);

  const [promoCodes] = useState<PromoCode[]>([
    { id: '1', code: 'SAVE50', discount: '50%', type: 'percentage', expiry: '2024-02-28', usage: { used: 342, limit: 500 }, status: 'active' },
    { id: '2', code: 'FREE100', discount: '₵10', type: 'fixed', expiry: '2024-03-15', usage: { used: 156, limit: 1000 }, status: 'active' },
  ]);

  const [deals] = useState<Deal[]>([
    { id: 1, name: 'Weekend Special', description: 'Buy 2 get 1 free on pizzas', price: 89.90, active: true },
    { id: 2, name: 'Family Pack', description: '4 pizzas + 4 drinks', price: 199.90, active: true },
  ]);

  const [banners] = useState<Banner[]>([
    { id: 1, title: 'Valentine Special', message: 'Love is in the air! Get 30% off on couple combos', status: 'active' },
    { id: 2, title: 'Summer Sale', message: 'Beat the heat with refreshing drinks. 50% off!', status: 'scheduled' },
  ]);

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    paused: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Promotions & Marketing</h1>
          <button onClick={() => setShowModal(true)} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600">
            <FiPlus /> Add Promotion
          </button>
        </div>

        <div className="flex gap-0 border-b border-gray-200">
          {[
            { id: 'codes', label: 'Promo Codes' },
            { id: 'deals', label: 'Deals & Combos' },
            { id: 'banners', label: 'Banners' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id ? 'border-red-500 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'codes' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Discount</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Expiry</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Usage</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-bold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {promoCodes.map(promo => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{promo.code}</td>
                    <td className="px-6 py-4 text-sm font-semibold">{promo.discount}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{promo.expiry}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{promo.usage.used}/{promo.usage.limit}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[promo.status]}`}>
                        {promo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="text-blue-500 hover:text-blue-700"><FiEdit2 /></button>
                      <button className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map(deal => (
              <div key={deal.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{deal.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{deal.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${deal.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {deal.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-red-600">₵{deal.price}</p>
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700"><FiEdit2 /></button>
                    <button className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="space-y-4">
            {banners.map(banner => (
              <div key={banner.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{banner.message}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[banner.status]}`}>
                    {banner.status}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700"><FiEdit2 /></button>
                    <button className="text-red-500 hover:text-red-700"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Promotion</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX />
              </button>
            </div>
            <div className="space-y-4">
              <input type="text" placeholder="Code/Title" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              <textarea placeholder="Description" className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20" />
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
