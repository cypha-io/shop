'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { FiStar, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

interface Review {
  id: number;
  customer: string;
  orderId: string;
  rating: number;
  comment: string;
  date: string;
  response?: string;
}

interface Complaint {
  id: string;
  orderId: string;
  customer: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  date: string;
}

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('reviews');

  const [reviews] = useState<Review[]>([
    { id: 1, customer: 'Kwesi Boateng', orderId: '#1001', rating: 5, comment: 'Excellent pizza! Fresh ingredients and great taste.', date: '2024-01-15' },
    { id: 2, customer: 'Abena Osei', orderId: '#1002', rating: 4, comment: 'Good, but took a bit longer than expected.', date: '2024-01-14', response: 'Thank you for feedback. We will improve delivery times.' },
    { id: 3, customer: 'Yaw Mensah', orderId: '#1000', rating: 3, comment: 'Pizza was cold when delivered.', date: '2024-01-13' },
  ]);

  const [complaints] = useState<Complaint[]>([
    { id: 'COMP001', orderId: '#1003', customer: 'Nadia Sarfo', issue: 'Wrong item delivered', severity: 'high', status: 'in-progress', date: '2024-01-16' },
    { id: 'COMP002', orderId: '#1002', customer: 'Ekua Adjei', issue: 'Delayed delivery by 30 minutes', severity: 'medium', status: 'resolved', date: '2024-01-15' },
  ]);

  const severityColors = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    open: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Reviews & Feedback</h1>

        <div className="flex gap-0 border-b border-gray-200">
          {[
            { id: 'reviews', label: 'Customer Reviews' },
            { id: 'complaints', label: 'Complaints & Support' },
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

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900">{review.customer}</p>
                      <span className="text-xs text-gray-600">{review.orderId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`text-sm ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-2">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{review.comment}</p>
                {review.response && (
                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500 mb-3">
                    <p className="text-sm font-medium text-blue-900">Admin Response:</p>
                    <p className="text-sm text-blue-800">{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-4">
            {complaints.map(complaint => (
              <div key={complaint.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <FiAlertTriangle className={`text-xl mt-1 ${
                      complaint.severity === 'high' ? 'text-red-500' :
                      complaint.severity === 'medium' ? 'text-orange-500' :
                      'text-yellow-500'
                    }`} />
                    <div>
                      <p className="font-semibold text-gray-900">{complaint.customer}</p>
                      <p className="text-sm text-gray-600">{complaint.orderId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${severityColors[complaint.severity]}`}>
                      {complaint.severity}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{complaint.issue}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">{complaint.date}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[complaint.status]}`}>
                    {complaint.status.replace('-', ' ').charAt(0).toUpperCase() + complaint.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
