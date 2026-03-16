'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiSettings, FiKey, FiMail, FiPhone, FiToggleRight, FiSave } from 'react-icons/fi';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    storeName: 'PizzaCity Ghana',
    minOrderValue: 25.00,
    deliveryChargeBase: 5.00,
    taxPercentage: 12.5,
    estimatedPrepTime: 20,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    dailyReport: true,
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Settings & Configuration</h1>

        <div className="flex gap-0 border-b border-gray-200 bg-white">
          {[
            { id: 'general', label: 'General Settings' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'integrations', label: 'Integrations' },
            { id: 'logs', label: 'Activity Logs' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition ${
                activeTab === tab.id ? 'bg-red-50 border-red-500 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl space-y-6 border border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Value (₹)</label>
              <input
                type="number"
                value={settings.minOrderValue}
                onChange={(e) => setSettings({...settings, minOrderValue: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Base Delivery Charge (₹)</label>
              <input
                type="number"
                value={settings.deliveryChargeBase}
                onChange={(e) => setSettings({...settings, deliveryChargeBase: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.taxPercentage}
                onChange={(e) => setSettings({...settings, taxPercentage: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Prep Time (minutes)</label>
              <input
                type="number"
                value={settings.estimatedPrepTime}
                onChange={(e) => setSettings({...settings, estimatedPrepTime: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button className="w-full bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-2">
              <FiSave /> Save Changes
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl space-y-4 border border-gray-200">
            {[
              { key: 'emailNotifications' as const, label: 'Email Notifications', icon: FiMail },
              { key: 'smsNotifications' as const, label: 'SMS Notifications', icon: FiPhone },
              { key: 'pushNotifications' as const, label: 'Push Notifications', icon: FiToggleRight },
              { key: 'dailyReport' as const, label: 'Daily Report', icon: FiToggleRight },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Icon className="text-red-500 text-xl" />
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotifications({...notifications, [key]: !notifications[key]})}
                  className={`w-12 h-6 rounded-full transition ${
                    notifications[key] ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition ${
                    notifications[key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl space-y-6 border border-gray-200">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiKey /> Payment Gateway
              </h3>
              <div className="space-y-3">
                <input placeholder="API Key" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Select Payment Provider</option>
                  <option>Stripe</option>
                  <option>PayPal</option>
                  <option>Razorpay</option>
                </select>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FiPhone /> SMS Provider
              </h3>
              <div className="space-y-3">
                <input placeholder="API Key" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Select SMS Provider</option>
                  <option>Twilio</option>
                  <option>AWS SNS</option>
                </select>
              </div>
            </div>
            <button className="w-full bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">
              Save Integration Settings
            </button>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'User logged in', user: 'Admin', time: '2 minutes ago' },
                { action: 'Order #1005 marked as completed', user: 'Kitchen Staff', time: '15 minutes ago' },
                { action: 'Menu item price updated', user: 'Manager', time: '1 hour ago' },
                { action: 'New staff member added', user: 'Admin', time: '3 hours ago' },
              ].map((log, idx) => (
                <div key={idx} className="p-4 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-600">By {log.user}</p>
                  </div>
                  <p className="text-xs text-gray-500">{log.time}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
