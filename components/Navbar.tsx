'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { IoHomeSharp } from 'react-icons/io5';
import { FiGrid, FiShoppingCart, FiClock, FiUser, FiLayout } from 'react-icons/fi';
import { useCart } from '@/hooks/useCart';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [authState, setAuthState] = useState<{ isLoggedIn: boolean; role?: 'user' | 'admin' }>({
    isLoggedIn: false,
  });
  const badgeText = totalItems > 99 ? '99+' : String(totalItems);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!response.ok) {
          setAuthState({ isLoggedIn: false });
          return;
        }

        const payload = (await response.json()) as {
          authenticated?: boolean;
          profile?: { role?: 'user' | 'admin' };
        };
        setAuthState({
          isLoggedIn: Boolean(payload.authenticated),
          role: payload.profile?.role,
        });
      } catch {
        setAuthState({ isLoggedIn: false });
      }
    };

    checkAuth();
  }, []);

  const profileHref = authState.isLoggedIn
    ? authState.role === 'admin'
      ? '/admin/dashboard'
      : '/dashboard'
    : '/account';
  const ProfileIcon = authState.isLoggedIn ? FiLayout : FiUser;

  return (
    <>
      <nav className="sticky top-0 z-50 pt-2 md:pt-4 bg-white/70 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 md:h-20">
            {/* Logo Section */}
            <div className="flex-shrink-0 pr-2 md:pr-8">
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt="Wig Factory GH Logo"
                  width={40}
                  height={40}
                  className="md:w-[60px] md:h-[60px] rounded-lg"
                />
              </Link>
            </div>

            {/* Middle Navigation Section - Desktop */}
            <div className="hidden md:flex items-center space-x-6 px-4 mx-auto bg-white/70 backdrop-blur-md rounded-full shadow-xl py-2">
              <Link
                href="/"
                className={`flex items-center gap-3 transition-colors px-6 py-3 rounded-full ${
                  pathname === '/' ? 'bg-pink-600 text-white' : 'text-gray-800 hover:text-pink-600'
                }`}
              >
                <IoHomeSharp className="text-2xl" />
                <span className="font-bold text-lg">Home</span>
              </Link>
              <Link
                href="/products"
                className={`flex items-center gap-3 transition-colors px-6 py-3 rounded-full ${
                  pathname === '/products' ? 'bg-pink-600 text-white' : 'text-gray-800 hover:text-pink-600'
                }`}
              >
                <FiGrid className="text-2xl" />
                <span className="font-bold text-lg">Products</span>
              </Link>
              <Link
                href="/cart"
                className={`flex items-center gap-3 transition-colors px-6 py-3 rounded-full relative ${
                  pathname === '/cart' ? 'bg-pink-600 text-white' : 'text-gray-800 hover:text-pink-600'
                }`}
              >
                <FiShoppingCart className="text-2xl" />
                <span className="font-bold text-lg">Cart</span>
                <span className="absolute -top-1 left-4 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {badgeText}
                </span>
              </Link>
              <Link
                href="/history"
                className={`flex items-center gap-3 transition-colors px-6 py-3 rounded-full ${
                  pathname === '/history' ? 'bg-pink-600 text-white' : 'text-gray-800 hover:text-pink-600'
                }`}
              >
                <FiClock className="text-2xl" />
                <span className="font-bold text-lg">History</span>
              </Link>
            </div>

            {/* Account Section */}
            <div className="hidden md:flex items-center pl-4">
              <Link
                href={profileHref}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 hover:bg-pink-600 hover:text-white transition-colors"
              >
                <ProfileIcon className="text-2xl" />
              </Link>
            </div>

            {/* Account Section - Mobile */}
            <div className="md:hidden flex items-center">
              <Link
                href={profileHref}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-pink-600 hover:text-white transition-colors"
              >
                <ProfileIcon className="text-lg" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-2 left-0 right-0 z-50 px-2">
        <div className="flex items-center justify-center space-x-3 px-3 mx-auto bg-white rounded-full py-1.5 max-w-fit shadow-xl">
          <Link
            href="/"
            className={`flex items-center gap-2 transition-colors px-3 py-2 rounded-full ${
              pathname === '/' ? 'bg-pink-600 text-white' : 'text-gray-800 hover:text-pink-600'
            }`}
          >
            <IoHomeSharp className="text-lg" />
            {pathname === '/' && <span className="font-bold text-sm">Home</span>}
          </Link>
          <Link
            href="/products"
            className={`flex items-center gap-2 transition-colors px-3 py-2 rounded-full ${
              pathname === '/products' ? 'bg-pink-600 text-white' : 'text-gray-800 hover:text-pink-600'
            }`}
          >
            <FiGrid className="text-lg" />
            {pathname === '/products' && <span className="font-bold text-sm">Products</span>}
          </Link>
          <Link
            href="/cart"
            className={`flex items-center gap-2 transition-colors px-3 py-2 rounded-full relative ${
              pathname === '/cart' ? 'bg-pink-600 text-white' : 'text-gray-800 hover:text-pink-600'
            }`}
          >
            <FiShoppingCart className="text-lg" />
            {pathname === '/cart' && <span className="font-bold text-sm">Cart</span>}
            <span className="absolute -top-0.5 left-2 bg-pink-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
              {badgeText}
            </span>
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-2 transition-colors px-3 py-2 rounded-full ${
              pathname === '/history' ? 'bg-pink-600 text-white' : 'text-gray-800 hover:text-pink-600'
            }`}
          >
            <FiClock className="text-lg" />
            {pathname === '/history' && <span className="font-bold text-sm">History</span>}
          </Link>
        </div>
      </div>
    </>
  );
}
