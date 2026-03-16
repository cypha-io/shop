'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-red-600 via-red-500 to-yellow-400 text-white py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            Welcome to <span className="text-yellow-300">Pizzacity</span>
          </h1>
          <p className="text-xl md:text-2xl font-semibold max-w-3xl mx-auto">
            Experience the Best Pizza, Chicken & Local Delights
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            Fresh ingredients, bold flavors, and fast delivery right to your door
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link 
              href="/menu" 
              className="bg-white text-red-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Order Now
              <FiArrowRight className="text-xl" />
            </Link>
            <Link 
              href="/menu" 
              className="bg-yellow-400 text-red-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition-all shadow-lg"
            >
              View Menu
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-300 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full opacity-10 blur-3xl"></div>
    </section>
  );
}
