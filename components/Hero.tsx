'use client';

import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-pink-600 via-pink-500 to-white text-white py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight">
            Welcome to <span className="text-white">Wig Factory GH</span>
          </h1>
          <p className="text-xl md:text-2xl font-semibold max-w-3xl mx-auto">
            Premium Wigs & Hair Extensions with Expert Styling
          </p>
          <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
            High quality wigs, affordable prices, and expert guidance right here
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link 
              href="/menu" 
              className="bg-white text-pink-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-100 hover:text-pink-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              Order Now
              <FiArrowRight className="text-xl" />
            </Link>
            <Link 
              href="/menu" 
              className="bg-pink-100 text-pink-700 px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-200 transition-all shadow-lg"
            >
              View Menu
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-pink-300 rounded-full opacity-20 blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full opacity-10 blur-3xl"></div>
    </section>
  );
}
