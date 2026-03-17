'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiPhone } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type AuthStep = 'phone' | 'login' | 'signup';

type Profile = {
  fullName: string;
  phone: string;
  role?: 'user' | 'admin';
  email: string;
  address: string;
  city: string;
};

const normalizePhoneInput = (value: string) => value.replace(/\D/g, '').slice(0, 10);
const isValidPhone = (value: string) => /^0\d{9}$/.test(value);

export default function AccountPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Accra',
  });

  const lookupPhone = async () => {
    const normalized = normalizePhoneInput(phone);
    if (!isValidPhone(normalized)) {
      setAuthError('Enter a valid phone number (10 digits, starts with 0).');
      return;
    }

    try {
      setLoading(true);
      setAuthError('');

      const response = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalized }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to check phone');
      }

      const payload = (await response.json()) as {
        exists: boolean;
        hasPassword: boolean;
        profile?: Profile;
      };

      if (payload.profile) {
        setProfile(payload.profile);
      } else {
        setProfile(prev => ({ ...prev, phone: normalized }));
      }

      if (payload.exists && payload.hasPassword) {
        setStep('login');
      } else {
        setStep('signup');
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to check phone');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      setAuthError('');

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: normalizePhoneInput(phone), password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Login failed');
      }

      const payload = (await response.json()) as { profile: Profile };
      window.localStorage.setItem('wf-user-phone', payload.profile.phone);
      const target = payload.profile.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      router.push(target);
      router.refresh();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async () => {
    const normalizedPhone = normalizePhoneInput(phone);

    if (!profile.fullName.trim()) {
      setAuthError('Full name is required.');
      return;
    }
    if (!isValidPhone(normalizedPhone)) {
      setAuthError('Phone number must be 10 digits and start with 0.');
      return;
    }
    if (password.trim().length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setAuthError('');

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, phone: normalizedPhone, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Signup failed');
      }

      const payload = (await response.json()) as { profile: Profile };
      window.localStorage.setItem('wf-user-phone', payload.profile.phone);
      const target = payload.profile.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      router.push(target);
      router.refresh();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">Secure access with your phone number.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-3xl p-8 shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
                <FiPhone className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Phone-First Account Access</h2>
                <p className="text-white/80 text-sm">We detect existing users automatically.</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-white/90">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                Existing users sign in with password.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                New users complete a signup form.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                Successful auth opens your dashboard automatically.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {step === 'phone' && 'Enter your phone number'}
              {step === 'login' && 'Enter your password'}
              {step === 'signup' && 'Complete your sign up'}
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              {step === 'phone' && 'We will use this to identify your account.'}
              {step === 'login' && `Welcome back. Phone: ${phone.trim()}`}
              {step === 'signup' && 'No account found with this number. Fill your details below.'}
            </p>

            {step === 'phone' && (
              <>
                <label className="block text-sm font-bold text-gray-700" htmlFor="phone">Phone Number</label>
                <div className="relative mt-2">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(normalizePhoneInput(e.target.value))}
                    inputMode="numeric"
                    pattern="0[0-9]{9}"
                    maxLength={10}
                    placeholder="0XXXXXXXXX"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-base"
                  />
                </div>
                <button
                  onClick={lookupPhone}
                  disabled={loading}
                  className="w-full mt-6 bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Checking...' : 'Continue'}
                </button>
              </>
            )}

            {step === 'login' && (
              <>
                <label className="block text-sm font-bold text-gray-700" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full mt-2 px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-base"
                />
                <button
                  onClick={login}
                  disabled={loading}
                  className="w-full mt-6 bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                <button
                  onClick={() => {
                    setStep('phone');
                    setPassword('');
                    setAuthError('');
                  }}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200"
                >
                  Use another number
                </button>
              </>
            )}

            {step === 'signup' && (
              <>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Full name"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-base"
                  />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email (optional)"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-base"
                  />
                  <input
                    type="text"
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Address (optional)"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-base"
                  />
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-base"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password (min 6 chars)"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-base"
                  />
                </div>
                <button
                  onClick={signup}
                  disabled={loading}
                  className="w-full mt-6 bg-orange-500 text-white py-3 rounded-2xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </>
            )}

            {authError && <p className="mt-3 text-sm font-semibold text-orange-500">{authError}</p>}

            <p className="text-xs text-gray-500 mt-4">
              By continuing, you agree to receive account-related messages.
            </p>

            <div className="mt-6">
              <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-orange-500">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
