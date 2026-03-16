'use client';

import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-12 mb-20 md:mb-0">
        <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 md:mb-8 text-center">Contact Us</h1>
        <p className="text-base md:text-xl text-gray-600 text-center mb-6 md:mb-12">Have a question? We&apos;d love to hear from you</p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-black text-gray-800 mb-6">Send us a message</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:outline-none" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-600 focus:outline-none"></textarea>
              </div>
              
              <button className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiPhone className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-800 mb-1">Phone</h3>
                  <p className="text-gray-600">+233 XX XXX XXXX</p>
                  <p className="text-sm text-gray-500 mt-1">Mon-Sun: 9AM - 11PM</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMail className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-800 mb-1">Email</h3>
                  <p className="text-gray-600">info@pizzacity.com</p>
                  <p className="text-sm text-gray-500 mt-1">We&apos;ll respond within 24 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="text-xl text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-800 mb-1">Locations</h3>
                  <p className="text-gray-600">Accra, North Legon, Agbogba</p>
                  <p className="text-gray-600">Winneba | Cape Coast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
