'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiShoppingCart } from 'react-icons/fi';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductViewModal, { ProductViewItem } from '@/components/ProductViewModal';
import { useProducts } from '@/hooks/useProducts';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedProduct, setSelectedProduct] = useState<ProductViewItem | null>(null);
  const { products: allProducts, loading } = useProducts();

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
    if (sortBy === 'price-asc') {
      return parsePrice(a.price) - parsePrice(b.price);
    }
    if (sortBy === 'price-desc') {
      return parsePrice(b.price) - parsePrice(a.price);
    }
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
              <h1 className="text-2xl md:text-4xl font-black text-gray-800 mb-4 md:mb-6 text-center">Search Menu</h1>
          
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
          {searchQuery && (
            <h2 className="text-2xl font-black text-gray-800 mb-6">
              {sortedProducts.length} Results for "{searchQuery}"
            </h2>
          )}
          
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative h-56 bg-gray-100 rounded-xl overflow-hidden shadow-lg mb-3 group">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                    <button className="absolute top-2 right-2 w-10 h-10 bg-pink-600 hover:bg-pink-700 rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg">
                      <FiShoppingCart className="text-white text-lg" />
                    </button>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-gray-800 text-base mb-2">{product.name}</h3>
                    <div className="bg-pink-600 rounded-lg px-4 py-2 inline-block">
                      <p className="text-white font-black text-sm">{product.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-500">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
          </>
        )}
      </main>

      <Footer />

      <ProductViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
