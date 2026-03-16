'use client';

import { useState } from 'react';
import { FiUser, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AccountPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [phone, setPhone] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = () => {
    const normalized = phone.trim();
    if (normalized.length < 7) {
      setLoginError('Enter a valid phone number.');
      return;
    }
    setLoginError('');
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Manage your profile, contact info, and delivery details.</p>
        </div>

        {!isLoggedIn ? (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-red-600 to-red-700 text-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                  <FiPhone className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Login with Phone</h2>
                  <p className="text-white/80 text-sm">Secure access to your account.</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-white/90">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                  Track your orders in real time.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                  Save delivery addresses for faster checkout.
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                  Access loyalty offers and promo codes.
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Enter your phone number</h3>
                  <p className="text-sm text-gray-500">We will use this to identify your account.</p>
                </div>
              </div>

              <label className="block text-sm font-bold text-gray-700" htmlFor="phone">
                Phone Number
              </label>
              <div className="relative mt-2">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (loginError) {
                      setLoginError('');
                    }
                  }}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-red-600 focus:outline-none text-base"
                />
              </div>
              {loginError && (
                <p className="mt-2 text-sm font-semibold text-red-600">{loginError}</p>
              )}

              <button
                onClick={handleLogin}
                className="w-full mt-6 bg-red-600 text-white py-3 rounded-2xl font-bold hover:bg-red-700 transition-colors"
              >
                Continue
              </button>

              <p className="text-xs text-gray-500 mt-4">
                By continuing, you agree to receive account-related messages.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center">
                    <FiUser className="text-4xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">John Doe</h2>
                    <p className="text-gray-600">Member since Feb 2026</p>
                  </div>
                </div>
                <button className="px-6 py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-gray-800">
                  Edit Profile
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                  <FiMail className="text-xl text-red-600 mt-1" />
                  <div>
                    <p className="font-bold text-gray-800">Email</p>
                    <p className="text-gray-600">john.doe@example.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                  <FiPhone className="text-xl text-red-600 mt-1" />
                  <div>
                    <p className="font-bold text-gray-800">Phone</p>
                    <p className="text-gray-600">{phone || '+233 XX XXX XXXX'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl sm:col-span-2">
                  <FiMapPin className="text-xl text-red-600 mt-1" />
                  <div>
                    <p className="font-bold text-gray-800">Default Address</p>
                    <p className="text-gray-600">Accra, North Legon</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 rounded-2xl bg-red-50 text-red-700 font-bold hover:bg-red-100">
                  Manage Addresses
                </button>
                <button className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-gray-800 font-bold hover:bg-gray-100">
                  Payment Methods
                </button>
                <button className="w-full px-4 py-3 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black">
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
