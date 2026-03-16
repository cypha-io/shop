'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12 mb-20 md:mb-0">
        <h1 className="text-3xl md:text-5xl font-black text-gray-800 mb-4 md:mb-8 text-center">About Pizzacity</h1>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to Pizzacity, your go-to destination for fresh, delicious pizza and chicken delivered right to your door. Since our founding, we&apos;ve been committed to using only the finest ingredients and time-tested recipes to create meals that bring joy to every table.
          </p>

          <h2 className="text-3xl font-black text-gray-800 mt-8">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            To deliver exceptional food experiences with every order, combining quality ingredients, bold flavors, and fast, reliable service.
          </p>

          <h2 className="text-3xl font-black text-gray-800 mt-8">What We Offer</h2>
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700">
            <li>Freshly made pizzas with premium toppings</li>
            <li>Crispy, flavorful fried and grilled chicken</li>
            <li>Delicious sides and appetizers</li>
            <li>Family and party packages</li>
            <li>Fast delivery to your location</li>
          </ul>

          <h2 className="text-3xl font-black text-gray-800 mt-8">Why Choose Us</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We pride ourselves on quality, speed, and customer satisfaction. Every meal is prepared fresh to order, ensuring you get the best taste and experience every time. Our team is dedicated to making your dining experience memorable.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
