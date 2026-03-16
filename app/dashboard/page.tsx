'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPackage, FiShoppingCart, FiClock } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';

type Profile = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
};

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
};

type Order = {
  id: number;
  orderNumber: string;
  status: 'Pending' | 'Delivered' | 'Cancelled';
  total: number;
  createdAt: string;
  items: OrderItem[];
};

const normalizePhoneInput = (value: string) => value.replace(/\D/g, '').slice(0, 10);
const isValidPhone = (value: string) => /^0\d{9}$/.test(value);

export default function UserDashboardPage() {
  const router = useRouter();
  const { items, totalItems } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Accra',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error('Failed to load orders');
        const data = (await response.json()) as Order[];
        setOrders(data);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    const storedPhone = window.localStorage.getItem('wf-user-phone') || '';
    if (storedPhone) {
      setProfile(prev => ({ ...prev, phone: storedPhone }));
      loadProfile(storedPhone);
    }
  }, []);

  const loadProfile = async (phone: string) => {
    const normalizedPhone = phone.trim();
    if (!normalizedPhone) return;

    try {
      setProfileLoading(true);
      const response = await fetch(`/api/profile?phone=${encodeURIComponent(normalizedPhone)}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = (await response.json()) as {
        fullName: string;
        phone: string;
        email: string | null;
        address: string | null;
        city: string | null;
      } | null;

      if (data) {
        setProfile({
          fullName: data.fullName || '',
          phone: data.phone || normalizedPhone,
          email: data.email || '',
          address: data.address || '',
          city: data.city || 'Accra',
        });
      }
    } catch {
      setProfileMessage('Could not load saved details. You can still save new details below.');
    } finally {
      setProfileLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile.fullName.trim() || !profile.phone.trim()) {
      setProfileMessage('Full name and phone are required.');
      return;
    }

    if (!isValidPhone(profile.phone.trim())) {
      setProfileMessage('Phone number must be 10 digits and start with 0.');
      return;
    }

    try {
      setProfileSaving(true);
      setProfileMessage('');

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to save profile');
      }

      window.localStorage.setItem('wf-user-phone', profile.phone.trim());
      setProfileMessage('Details updated successfully.');
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const activeOrders = useMemo(
    () => orders.filter(order => order.status === 'Pending').length,
    [orders]
  );

  const recentOrders = orders.slice(0, 5);
  const cartTotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price.replace(/[^0-9.]/g, '')) * item.quantity, 0),
    [items]
  );

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/account');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">User Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your cart, active orders, and recent purchases.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Cart Items</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{totalItems}</p>
            <p className="text-sm text-pink-600 font-bold mt-2">GH₵{cartTotal.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Active Orders</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{activeOrders}</p>
            <p className="text-sm text-gray-500 mt-2">Pending confirmation or delivery</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">Total Orders</p>
            <p className="text-3xl font-black text-gray-900 mt-1">{orders.length}</p>
            <p className="text-sm text-gray-500 mt-2">All-time purchase count</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 mb-6">
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-xl font-black text-gray-900">Recent Orders</h2>
            </div>

            {loading ? (
              <div className="px-5 py-10 text-gray-600">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-gray-600">No orders yet.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentOrders.map(order => (
                  <div key={order.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Delivered'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'Cancelled'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                    <p className="font-black text-pink-600">GH₵{Number(order.total).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-xl font-black text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/products" className="w-full px-4 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black flex items-center gap-2">
                <FiPackage />
                Browse Products
              </Link>
              <Link href="/cart" className="w-full px-4 py-3 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 flex items-center gap-2">
                <FiShoppingCart />
                Go to Cart
              </Link>
              <Link href="/history" className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 flex items-center gap-2">
                <FiClock />
                View Order History
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full px-4 py-3 rounded-xl bg-black text-white font-bold hover:bg-gray-900"
              >
                Logout
              </button>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-black text-gray-900">My Details</h2>
            {profileLoading && <p className="text-sm text-gray-500">Loading details...</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-600"
            />

            <div className="flex gap-2">
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: normalizePhoneInput(e.target.value) }))}
                inputMode="numeric"
                pattern="0[0-9]{9}"
                maxLength={10}
                placeholder="0XXXXXXXXX"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-600"
              />
              <button
                type="button"
                onClick={() => loadProfile(profile.phone)}
                className="px-4 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200"
              >
                Load
              </button>
            </div>

            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-600"
            />

            <input
              type="text"
              value={profile.city}
              onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
              placeholder="City"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-600"
            />

            <input
              type="text"
              value={profile.address}
              onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Address"
              className="w-full sm:col-span-2 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-600"
            />
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={saveProfile}
              disabled={profileSaving}
              className="px-6 py-3 rounded-xl bg-pink-600 text-white font-bold hover:bg-pink-700 disabled:opacity-60"
            >
              {profileSaving ? 'Saving...' : 'Save Details'}
            </button>
            {profileMessage && <p className="text-sm font-semibold text-gray-700">{profileMessage}</p>}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
