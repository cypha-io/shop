'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { IoHomeSharp } from 'react-icons/io5';
import { FiSearch, FiShoppingCart, FiClock, FiUser, FiMapPin, FiChevronDown } from 'react-icons/fi';

export default function Navbar() {
  const pathname = usePathname();
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Select Location');
  const locationMenuRef = useRef<HTMLDivElement>(null);

  const locations = [
    'Agbogba, Accra',
    'Winneba',
    'Cape Coast'
  ];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setShowLocationMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationMenuRef.current && !locationMenuRef.current.contains(event.target as Node)) {
        setShowLocationMenu(false);
      }
    };

    if (showLocationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationMenu]);

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
                  alt="Pizzacity Logo"
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
                  pathname === '/' ? 'bg-red-600 text-white' : 'text-gray-800 hover:text-red-600'
                }`}
              >
                <IoHomeSharp className="text-2xl" />
                <span className="font-bold text-lg">Home</span>
              </Link>
              <Link
                href="/search"
                className={`flex items-center gap-3 transition-colors px-6 py-3 rounded-full ${
                  pathname === '/search' ? 'bg-red-600 text-white' : 'text-gray-800 hover:text-red-600'
                }`}
              >
                <FiSearch className="text-2xl" />
                <span className="font-bold text-lg">Search</span>
              </Link>
              <Link
                href="/cart"
                className={`flex items-center gap-3 transition-colors px-6 py-3 rounded-full relative ${
                  pathname === '/cart' ? 'bg-red-600 text-white' : 'text-gray-800 hover:text-red-600'
                }`}
              >
                <FiShoppingCart className="text-2xl" />
                <span className="font-bold text-lg">Cart</span>
                <span className="absolute -top-1 left-4 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  0
                </span>
              </Link>
              <Link
                href="/history"
                className={`flex items-center gap-3 transition-colors px-6 py-3 rounded-full ${
                  pathname === '/history' ? 'bg-red-600 text-white' : 'text-gray-800 hover:text-red-600'
                }`}
              >
                <FiClock className="text-2xl" />
                <span className="font-bold text-lg">History</span>
              </Link>
            </div>

            {/* Location Section - Desktop */}
            <div ref={locationMenuRef} className="hidden md:flex items-center pl-8 relative">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-3 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-md"
              >
                <FiMapPin className="text-2xl text-white" />
                <p className="text-base font-black text-white">{selectedLocation}</p>
                <FiChevronDown className="text-xl text-white" />
              </button>

              {showLocationMenu && (
                <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-2xl py-2 w-56 z-50">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full text-left px-6 py-3 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-gray-800"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Account Section */}
            <div className="hidden md:flex items-center pl-4">
              <Link
                href="/account"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 hover:bg-red-600 hover:text-white transition-colors"
              >
                <FiUser className="text-2xl" />
              </Link>
            </div>

            {/* Mobile: Location and Account */}
            <div className="md:hidden flex items-center gap-2 flex-1 justify-center relative">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors shadow-md"
              >
                <FiMapPin className="text-sm text-white" />
                <span className="text-xs font-bold text-white truncate max-w-[80px]">{selectedLocation}</span>
                <FiChevronDown className="text-xs text-white" />
              </button>

              {showLocationMenu && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-2xl py-2 w-48 z-50">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-gray-800 text-sm"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <Link
                href="/account"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-red-600 hover:text-white transition-colors"
              >
                <FiUser className="text-lg" />
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
              pathname === '/' ? 'bg-red-600 text-white' : 'text-gray-800 hover:text-red-600'
            }`}
          >
            <IoHomeSharp className="text-lg" />
            {pathname === '/' && <span className="font-bold text-sm">Home</span>}
          </Link>
          <Link
            href="/search"
            className={`flex items-center gap-2 transition-colors px-3 py-2 rounded-full ${
              pathname === '/search' ? 'bg-red-600 text-white' : 'text-gray-800 hover:text-red-600'
            }`}
          >
            <FiSearch className="text-lg" />
            {pathname === '/search' && <span className="font-bold text-sm">Search</span>}
          </Link>
          <Link
            href="/cart"
            className={`flex items-center gap-2 transition-colors px-3 py-2 rounded-full relative ${
              pathname === '/cart' ? 'bg-red-600 text-white' : 'text-gray-800 hover:text-red-600'
            }`}
          >
            <FiShoppingCart className="text-lg" />
            {pathname === '/cart' && <span className="font-bold text-sm">Cart</span>}
            <span className="absolute -top-0.5 left-2 bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center border border-white">
              0
            </span>
          </Link>
          <Link
            href="/history"
            className={`flex items-center gap-2 transition-colors px-3 py-2 rounded-full ${
              pathname === '/history' ? 'bg-red-600 text-white' : 'text-gray-800 hover:text-red-600'
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
