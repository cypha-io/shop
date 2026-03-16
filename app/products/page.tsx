'use client';

import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const { products: allProducts, loading, error } = useProducts();

  const categories = ['All', ...Array.from(new Set(allProducts.map(product => product.category)))];

  const parsePrice = (price: string) => Number(price.replace(/[^0-9.]/g, ''));
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.category.toLowerCase().includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return parsePrice(a.price) - parsePrice(b.price);
    if (sortBy === 'price-desc') return parsePrice(b.price) - parsePrice(a.price);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h1 className="text-2xl md:text-4xl font-black text-gray-800 mb-4 md:mb-6 text-center">All Products</h1>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for wigs, hair extensions, bundles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-full border-2 border-gray-200 focus:border-pink-600 focus:outline-none text-lg"
                />
              </div>

              {/* Filters */}
              <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                        activeCategory === category
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm font-semibold text-gray-600">Sort</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:border-pink-600"
                  >
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="price-asc">Price (Low-High)</option>
                    <option value="price-desc">Price (High-Low)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            <div>
              {error && (
                <div className="text-center py-20 mb-6 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xl text-red-600">Error: {error}</p>
                </div>
              )}

              {searchQuery && !loading && (
                <h2 className="text-2xl font-black text-gray-800 mb-6">
                  {sortedProducts.length} Results for &quot;{searchQuery}&quot;
                </h2>
              )}

              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : !loading && searchQuery ? (
                <div className="text-center py-20">
                  <p className="text-xl text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
