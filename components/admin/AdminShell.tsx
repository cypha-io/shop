'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiBarChart2,
  FiChevronDown,
  FiChevronUp,
  FiGrid,
  FiMenu,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiTag,
  FiUsers,
  FiX,
} from 'react-icons/fi';

type AdminShellProps = {
  children: React.ReactNode;
  userDisplayName: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: FiBarChart2 },
  { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
  { href: '/admin/products', label: 'Products', icon: FiPackage },
  { href: '/admin/categories', label: 'Categories', icon: FiTag },
  { href: '/admin/analytics', label: 'Analytics', icon: FiGrid },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/settings', label: 'Settings', icon: FiSettings },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const [isProductsOpen, setIsProductsOpen] = useState(pathname.startsWith('/admin/products'));

  return (
    <nav className="space-y-2">
      {NAV_ITEMS.map(item => {
        if (item.href === '/admin/products') {
          const isProductsRoute = pathname.startsWith('/admin/products');
          const ProductChevron = isProductsOpen ? FiChevronUp : FiChevronDown;

          return (
            <div key={item.href} className="space-y-2">
              <button
                type="button"
                onClick={() => setIsProductsOpen(prev => !prev)}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 font-semibold transition ${
                  isProductsRoute
                    ? 'bg-pink-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  <FiPackage />
                  Products
                </span>
                <ProductChevron />
              </button>

              {isProductsOpen && (
                <div className="ml-4 space-y-2">
                  <Link
                    href="/admin/products"
                    onClick={onNavigate}
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      pathname === '/admin/products'
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Manage Products
                  </Link>
                  <Link
                    href="/admin/products/new"
                    onClick={onNavigate}
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      pathname === '/admin/products/new'
                        ? 'bg-pink-100 text-pink-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Add Product
                  </Link>
                </div>
              )}
            </div>
          );
        }

        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition ${
              isActive
                ? 'bg-pink-600 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children, userDisplayName }: AdminShellProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
          <Link href="/admin/dashboard" className="mb-8 flex items-center gap-3">
            <Image src="/logo.png" alt="Wig Factory" width={44} height={44} className="rounded-xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
              <p className="text-lg font-black text-slate-900">Wig Factory</p>
            </div>
          </Link>

          <NavLinks pathname={pathname} />

          <div className="mt-auto rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Signed in as</p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">{userDisplayName}</p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <Image src="/logo.png" alt="Wig Factory" width={34} height={34} className="rounded-lg" />
                <span className="text-sm font-black">Admin</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700"
                aria-label="Open admin menu"
              >
                <FiMenu className="text-lg" />
              </button>
            </div>
          </header>

          {isSidebarOpen && (
            <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="absolute inset-0 bg-slate-900/40"
                aria-label="Close admin menu overlay"
              />
              <aside className="absolute left-0 top-0 h-full w-80 max-w-[85vw] border-r border-slate-200 bg-white p-5 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                  <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
                    <Image src="/logo.png" alt="Wig Factory" width={34} height={34} className="rounded-lg" />
                    <span className="text-sm font-black">Admin Panel</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(false)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-700"
                    aria-label="Close admin menu"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>

                <NavLinks pathname={pathname} onNavigate={() => setIsSidebarOpen(false)} />

                <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Signed in as</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">{userDisplayName}</p>
                </div>
              </aside>
            </div>
          )}

          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
