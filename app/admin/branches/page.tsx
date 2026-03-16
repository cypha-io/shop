'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiClock } from 'react-icons/fi';

interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  openHours: string;
  radius: string;
  active: boolean;
}

export default function BranchesPage() {
  const [branches] = useState<Branch[]>([
    { id: 1, name: 'Accra Store', address: '123 Oxford Street, Osu, Accra', phone: '+233-2-1234567', openHours: '10 AM - 11 PM', radius: '5 km', active: true },
    { id: 2, name: 'Kumasi Store', address: '456 Ashanti Road, Kumasi', phone: '+233-3-2345678', openHours: '11 AM - 10 PM', radius: '7 km', active: true },
    { id: 3, name: 'Tema Store', address: '789 Harbor Way, Tema', phone: '+233-3-3456789', openHours: '9 AM - Midnight', radius: '10 km', active: false },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Branches & Store Settings</h1>
          <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-red-700 hover:shadow-md transition-all duration-200">
            <FiPlus size={20} /> Add Branch
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => (
            <div 
              key={branch.id} 
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{branch.name}</h3>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg mt-2 inline-block border ${
                      branch.active 
                        ? 'bg-green-100/80 text-green-800 border-green-300' 
                        : 'bg-gray-100/80 text-gray-800 border-gray-300'
                    }`}>
                      {branch.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 hover:scale-110 transition-all"><FiEdit2 size={16} /></button>
                    <button className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:scale-110 transition-all"><FiTrash2 size={16} /></button>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-200/50">
                  <div className="flex items-start gap-3">
                    <FiMapPin className="text-red-600 text-lg mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Address</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{branch.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FiClock className="text-orange-600 text-lg mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Hours</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{branch.openHours}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-base mt-0.5">📱</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">{branch.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
