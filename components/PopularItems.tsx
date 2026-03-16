'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FiShoppingCart } from 'react-icons/fi';
import ProductViewModal, { ProductViewItem } from '@/components/ProductViewModal';
import { useProducts } from '@/hooks/useProducts';

export default function PopularItems() {
  const [selectedProduct, setSelectedProduct] = useState<ProductViewItem | null>(null);
  const { products, loading } = useProducts();

  const displayProducts = products.slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
      <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 md:mb-8 text-center">Popular</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
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
      )}

      <ProductViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
