'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="text-white mt-16 mb-4 mx-4">
      <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-lg bg-red-600">
        <div className="px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and About */}
            <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="Pizzacity Logo" 
                width={50} 
                height={50}
                className="rounded-lg"
              />
              <span className="text-2xl font-black text-white">PIZZACITY</span>
            </Link>
            <p className="text-white text-sm">
              Fresh ingredients, bold flavors, and fast delivery right to your door. Experience the best pizza and chicken in town.
            </p>
            {/* Social Media */}
            <div className="flex gap-4 pt-2">
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
            </div>

            {/* Quick Links */}
            <div className="hidden md:block">
              <h3 className="text-lg font-black mb-4 text-yellow-400">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/menu" className="text-white hover:text-yellow-400 transition-colors">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-white hover:text-yellow-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/locations" className="text-white hover:text-yellow-400 transition-colors">
                    Locations
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white hover:text-yellow-400 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div className="hidden md:block">
              <h3 className="text-lg font-black mb-4 text-yellow-400">Customer Service</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/faq" className="text-white hover:text-yellow-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/delivery" className="text-white hover:text-yellow-400 transition-colors">
                    Delivery Info
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-white hover:text-yellow-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-white hover:text-yellow-400 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="hidden md:block">
              <h3 className="text-lg font-black mb-4 text-yellow-400">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FiPhone className="text-xl text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white">+233 XX XXX XXXX</p>
                    <p className="text-white text-sm">Mon-Sun: 9AM - 11PM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FiMail className="text-xl text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-white">info@pizzacity.com</p>
                </li>
                <li className="flex items-start gap-3">
                  <FiMapPin className="text-xl text-yellow-400 mt-1 flex-shrink-0" />
                  <p className="text-white">Accra, North Legon, Agbogba | Winneba | Cape Coast</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-red-700 pt-8 hidden md:block">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white text-sm text-center md:text-left">
                © 2026 Pizzacity. All rights reserved.
              </p>
              <div className="flex gap-6 text-sm">
                <Link href="/privacy" className="text-white hover:text-yellow-400 transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-white hover:text-yellow-400 transition-colors">
                  Terms
                </Link>
                <Link href="/cookies" className="text-white hover:text-yellow-400 transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
