'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiShoppingCart } from 'react-icons/fi';
import ProductViewModal, { ProductViewItem } from '@/components/ProductViewModal';

export default function PopularItems() {
  const [selectedProduct, setSelectedProduct] = useState<ProductViewItem | null>(null);
  const products = [
    {
      id: 1,
      name: 'Pepperoni Pizza',
      price: 'GH₵45',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80'
    },
    {
      id: 2,
      name: 'Fried Chicken',
      price: 'GH₵35',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80'
    },
    {
      id: 3,
      name: 'BBQ Wings',
      price: 'GH₵40',
      image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80'
    },
    {
      id: 4,
      name: 'Margherita Pizza',
      price: 'GH₵42',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80'
    },
    {
      id: 5,
      name: 'Chicken Burger',
      price: 'GH₵30',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'
    },
    {
      id: 6,
      name: 'Cheese Pizza',
      price: 'GH₵38',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80'
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
      <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 md:mb-8 text-center">Popular</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            {/* Image */}
            <div className="relative h-40 bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-3 group">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
              {/* Cart Icon Overlay */}
              <button className="absolute top-2 right-2 w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg">
                <FiShoppingCart className="text-gray-900 text-lg" />
              </button>
            </div>
            
            {/* Name and Price */}
            <div className="text-center">
              <h3 className="font-bold text-gray-800 text-sm mb-2">{product.name}</h3>
              <div className="bg-red-600 rounded-lg px-3 py-1.5 inline-block">
                <p className="text-white font-black text-sm">{product.price}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ProductViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
