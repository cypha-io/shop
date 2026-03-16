'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiShoppingCart } from 'react-icons/fi';
import ProductViewModal, { ProductViewItem } from '@/components/ProductViewModal';

export default function Featured() {
  const [selectedProduct, setSelectedProduct] = useState<ProductViewItem | null>(null);
  const products = [
    {
      id: 1,
      name: 'Premium Silk Wig',
      price: 'GH₵180',
      image: 'https://images.unsplash.com/photo-1532746622552-99dadbdfa7fb?w=400&q=80'
    },
    {
      id: 2,
      name: 'Brazilian Straight',
      price: 'GH₵165',
      image: 'https://images.unsplash.com/photo-1612119782306-72d440642117?w=400&q=80'
    },
    {
      id: 3,
      name: 'Luxury Closure',
      price: 'GH₵145',
      image: 'https://images.unsplash.com/photo-1562322633-91bd282ca975?w=400&q=80'
    },
    {
      id: 4,
      name: 'HD Lace Wig',
      price: 'GH₵190',
      image: 'https://images.unsplash.com/photo-1585128884174-7c2b91e90a65?w=400&q=80'
    },
    {
      id: 5,
      name: 'Curly Mix Wig',
      price: 'GH₵155',
      image: 'https://images.unsplash.com/photo-1597423244036-adc5ffd0a4b2?w=400&q=80'
    },
    {
      id: 6,
      name: 'Deep Wave Bundle',
      price: 'GH₵140',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80'
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
      <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 md:mb-8 text-center">Featured</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="cursor-pointer"
            onClick={() => setSelectedProduct(product)}
          >
            {/* Image */}
            <div className="relative h-56 bg-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-4 group">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
              {/* Cart Icon Overlay */}
              <button className="absolute top-2 right-2 w-10 h-10 bg-pink-400 hover:bg-pink-500 rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg">
                <FiShoppingCart className="text-gray-900 text-lg" />
              </button>
            </div>
            
            {/* Name and Price */}
            <div className="text-center">
              <h3 className="font-bold text-gray-800 text-base mb-3">{product.name}</h3>
              <div className="bg-pink-600 rounded-lg px-4 py-2 inline-block">
                <p className="text-white font-black text-base">{product.price}</p>
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
