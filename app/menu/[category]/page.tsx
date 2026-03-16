'use client';

import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const { products, loading, error } = useProducts({ category });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Categories activeCategory={category} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 mb-20 md:mb-0">
        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-xl text-red-600">Error: {error}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                href={`/menu/${category}/${product.id}`}
                size="compact"
                showCategory={false}
                showViewLabel={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No products found in this category.</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
