'use client';

import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';

export default function NewArrivals() {
  const { products, loading, error } = useProducts();

  const displayProducts = products.slice(3, 9);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
      <h2 className="text-lg md:text-xl font-black text-gray-800 mb-4 md:mb-8 text-center">New Arrivals</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-red-600">Error: {error}</p>
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-600">No products available</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
