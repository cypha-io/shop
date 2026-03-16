'use client';

import { useState } from 'react';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import ProductViewModal, { ProductViewItem } from '@/components/ProductViewModal';

const featuredItems = [
  {
    id: 1,
    name: 'Spicy Pepperoni Pizza',
    description: 'Loaded with pepperoni, jalapeños, and extra cheese',
    price: 'GH₵ 89.00',
    rating: 4.8,
    image: '🍕',
    badge: 'Best Seller',
    badgeColor: 'bg-red-600'
  },
  {
    id: 2,
    name: 'Crispy Fried Chicken',
    description: 'Golden fried chicken with special spices',
    price: 'GH₵ 65.00',
    rating: 4.9,
    image: '🍗',
    badge: 'Popular',
    badgeColor: 'bg-yellow-500'
  },
  {
    id: 3,
    name: 'Chickenman Jollof',
    description: 'Savory jollof rice with tender chicken pieces',
    price: 'GH₵ 55.00',
    rating: 4.7,
    image: '🍚',
    badge: 'Chef Special',
    badgeColor: 'bg-red-500'
  },
];

export default function FeaturedMenu() {
  const [selectedProduct, setSelectedProduct] = useState<ProductViewItem | null>(null);

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
            <span className="text-red-600">Featured</span> Items
          </h2>
          <p className="text-xl text-gray-600">Our most loved dishes, hand-picked for you</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all overflow-hidden border-4 border-transparent hover:border-red-500 group"
              onClick={() => setSelectedProduct({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                category: 'Featured',
                description: item.description,
              })}
            >
              {/* Badge */}
              <div className="relative">
                <div className={`absolute top-4 right-4 ${item.badgeColor} text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg z-10`}>
                  {item.badge}
                </div>
                
                {/* Image placeholder */}
                <div className="bg-gradient-to-br from-yellow-100 to-red-100 h-48 flex items-center justify-center text-8xl">
                  {item.image}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-gray-900">{item.name}</h3>
                  <div className="flex items-center gap-1 bg-yellow-400 px-3 py-1 rounded-full">
                    <FiStar className="text-white fill-white" />
                    <span className="font-bold text-white">{item.rating}</span>
                  </div>
                </div>
                
                <p className="text-gray-600 font-medium">{item.description}</p>
                
                <div className="flex items-center justify-between pt-4">
                  <span className="text-3xl font-black text-red-600">{item.price}</span>
                  <button 
                    className="bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg group-hover:scale-105"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedProduct({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        image: item.image,
                        category: 'Featured',
                        description: item.description,
                      });
                    }}
                  >
                    <FiShoppingCart className="text-xl" />
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ProductViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  );
}
