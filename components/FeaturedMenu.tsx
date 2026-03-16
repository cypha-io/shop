'use client';

import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export default function FeaturedMenu() {
  const { products, loading, error } = useProducts({ featured: true, limit: 3 });

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
            <span className="text-pink-600">Featured</span> Items
          </h2>
          <p className="text-xl text-gray-600">Our most loved dishes, hand-picked for you</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-10 text-gray-600">Loading featured items...</div>
          ) : error ? (
            <div className="col-span-full text-center py-10 text-red-600">Error: {error}</div>
          ) : products.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-600">No featured items available.</div>
          ) : (
            products.map((item) => (
              <div key={`${item.category}-${item.id}`} className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100">
                <ProductCard
                  product={item}
                  href={`/menu/${item.category.toLowerCase()}/${item.id}`}
                />
                <div className="px-2 pb-2">
                  <p className="text-sm text-gray-600 text-center">{item.description || 'Customer favorite'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
