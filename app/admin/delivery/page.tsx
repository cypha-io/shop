'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi';

interface Driver {
  id: number;
  name: string;
  phone: string;
  status: 'online' | 'offline' | 'busy';
  completed: number;
  rating: number;
}

interface Zone {
  id: number;
  name: string;
  radius: string;
  fee: number;
}

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [drivers] = useState<Driver[]>([
    { id: 1, name: 'Kwame Asante', phone: '+233-24-1234567', status: 'online', completed: 145, rating: 4.8 },
    { id: 2, name: 'Ama Osei', phone: '+233-55-2345678', status: 'offline', completed: 89, rating: 4.6 },
    { id: 3, name: 'Kofi Mensah', phone: '+233-50-3456789', status: 'busy', completed: 203, rating: 4.9 },
  ]);

  const [zones] = useState<Zone[]>([
    { id: 1, name: 'Central Accra', radius: '5 km', fee: 5.00 },
    { id: 2, name: 'Greater Accra', radius: '7 km', fee: 8.00 },
    { id: 3, name: 'Outer Districts', radius: '10 km', fee: 12.00 },
  ]);

  const statusColors = {
    online: 'bg-green-100/80 text-green-800 border-green-300',
    offline: 'bg-gray-100/80 text-gray-800 border-gray-300',
    busy: 'bg-yellow-100/80 text-yellow-800 border-yellow-300',
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <h1 className="text-3xl font-bold text-gray-900">Delivery Management</h1>

        <div className="flex gap-0 border-b border-gray-200 bg-white rounded-t-lg">
          {[
            { id: 'drivers', label: 'Drivers' },
            { id: 'zones', label: 'Delivery Zones' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id 
                  ? 'border-red-600 text-red-600 bg-red-50' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'drivers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map(driver => (
              <div 
                key={driver.id} 
                className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm hover:shadow-md border border-gray-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{driver.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{driver.phone}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${statusColors[driver.status]}`}>
                    {driver.status}
                  </span>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-600">Completed Orders</p>
                    <p className="font-bold text-gray-900">{driver.completed}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-600">Rating</p>
                    <p className="font-bold text-yellow-500">⭐ {driver.rating}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zones.map(zone => (
              <div 
                key={zone.id} 
                className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm hover:shadow-md border border-gray-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <FiMapPin className="text-red-600" size={20} />
                      {zone.name}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"><FiEdit2 size={16} /></button>
                    <button className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"><FiTrash2 size={16} /></button>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-600">Delivery Radius</p>
                    <p className="font-bold text-gray-900">{zone.radius}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-600">Delivery Fee</p>
                    <p className="font-bold text-red-600">₵{zone.fee.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
