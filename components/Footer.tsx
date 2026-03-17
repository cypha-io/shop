'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="text-white mt-16 mb-4 mx-4">
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-lg bg-orange-500">
        <div className="px-6 py-10">
          <div className="max-w-3xl mx-auto space-y-5 text-center">
            <Link href="/" className="flex items-center justify-center">
              <Image 
                src="/logo.png" 
                alt="Wig Factory GH Logo" 
                width={50} 
                height={50}
                className="rounded-lg"
              />
            </Link>
            <p className="text-white text-sm md:text-base">
              Premium quality wigs and hair extensions with expert styling and affordable prices. Your ultimate destination for beautiful hair in Ghana.
            </p>
            <div className="flex justify-center gap-4 pt-1">
              <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <FiFacebook className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <FiInstagram className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                <FiTwitter className="text-xl" />
              </a>
            </div>
            <p className="text-white/90 text-xs md:text-sm pt-2">
              © 2026 Wig Factory GH. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
