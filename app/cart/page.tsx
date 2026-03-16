'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Pepperoni Pizza', price: 45, quantity: 2, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
    { id: 2, name: 'Fried Chicken', price: 35, quantity: 1, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80' },
    { id: 3, name: 'French Fries', price: 15, quantity: 3, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80' },
  ]);

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 10;
  const total = subtotal + delivery;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-800 mb-6 sm:mb-8 text-center">Shopping Cart</h1>

        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative w-full sm:w-24 h-40 sm:h-24 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-black text-lg text-gray-800">{item.name}</h3>
                    <p className="text-red-600 font-bold">GH₵{item.price}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
                        <FiMinus className="text-gray-600" />
                      </button>
                      <span className="font-black text-lg w-8 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center">
                        <FiPlus className="text-gray-600" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center sm:hidden">
                      <FiTrash2 className="text-red-600" />
                    </button>
                  </div>

                  <button onClick={() => removeItem(item.id)} className="hidden sm:flex w-10 h-10 bg-red-50 hover:bg-red-100 rounded-full items-center justify-center">
                    <FiTrash2 className="text-red-600" />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 h-fit lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-5 sm:mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">GH₵{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-bold">GH₵{delivery}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-black text-lg">Total</span>
                  <span className="font-black text-xl text-red-600">GH₵{total}</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3.5 sm:py-4 rounded-xl font-black text-base sm:text-lg hover:from-red-500 hover:to-red-400 transition-all">
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 mb-6">Your cart is empty</p>
            <Link href="/" className="inline-block bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700">
              Start Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
