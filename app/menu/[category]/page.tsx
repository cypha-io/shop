'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FiShoppingCart } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Categories from '@/components/Categories';
import Footer from '@/components/Footer';
import ProductViewModal, { ProductViewItem } from '@/components/ProductViewModal';

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;
  const [selectedProduct, setSelectedProduct] = useState<ProductViewItem | null>(null);
  
  // Capitalize category name
  const categoryName = category.charAt(0).toUpperCase() + category.slice(1);

  // Sample products data - in a real app, this would come from an API
  const categoryProducts: Record<string, any[]> = {
    pizza: [
      { id: 1, name: 'Margherita Pizza', price: 'GH₵42', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
      { id: 2, name: 'Pepperoni Pizza', price: 'GH₵45', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
      { id: 3, name: 'BBQ Chicken Pizza', price: 'GH₵48', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
      { id: 4, name: 'Vegetarian Pizza', price: 'GH₵40', image: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400&q=80' },
      { id: 5, name: 'Hawaiian Pizza', price: 'GH₵46', image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80' },
      { id: 6, name: 'Meat Lovers Pizza', price: 'GH₵52', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96f47?w=400&q=80' },
    ],
    chicken: [
      { id: 1, name: 'Fried Chicken', price: 'GH₵35', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80' },
      { id: 2, name: 'BBQ Wings', price: 'GH₵40', image: 'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&q=80' },
      { id: 3, name: 'Grilled Chicken', price: 'GH₵38', image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&q=80' },
      { id: 4, name: 'Chicken Tenders', price: 'GH₵32', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80' },
      { id: 5, name: 'Spicy Wings', price: 'GH₵42', image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&q=80' },
      { id: 6, name: 'Chicken Bucket', price: 'GH₵65', image: 'https://images.unsplash.com/photo-1569058242252-92bd747b78c2?w=400&q=80' },
    ],
    sides: [
      { id: 1, name: 'French Fries', price: 'GH₵15', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80' },
      { id: 2, name: 'Chicken Burger', price: 'GH₵30', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
      { id: 3, name: 'Onion Rings', price: 'GH₵18', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80' },
      { id: 4, name: 'Coleslaw', price: 'GH₵12', image: 'https://images.unsplash.com/photo-1610419913848-aeae5eae13e3?w=400&q=80' },
      { id: 5, name: 'Mozzarella Sticks', price: 'GH₵22', image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=400&q=80' },
      { id: 6, name: 'Garlic Bread', price: 'GH₵16', image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=400&q=80' },
    ],
    packages: [
      { id: 1, name: 'Family Package', price: 'GH₵120', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' },
      { id: 2, name: 'Party Package', price: 'GH₵200', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80' },
      { id: 3, name: 'Couple Package', price: 'GH₵80', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' },
      { id: 4, name: 'Student Package', price: 'GH₵55', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
      { id: 5, name: 'Office Package', price: 'GH₵150', image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96f47?w=400&q=80' },
      { id: 6, name: 'Weekend Special', price: 'GH₵95', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80' },
    ],
    drinks: [
      { id: 1, name: 'Coca Cola', price: 'GH₵8', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
      { id: 2, name: 'Sprite', price: 'GH₵8', image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80' },
      { id: 3, name: 'Fanta', price: 'GH₵8', image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&q=80' },
      { id: 4, name: 'Bottled Water', price: 'GH₵5', image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80' },
      { id: 5, name: 'Fresh Juice', price: 'GH₵12', image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
      { id: 6, name: 'Smoothie', price: 'GH₵18', image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&q=80' },
    ],
    desserts: [
      { id: 1, name: 'Chocolate Cake', price: 'GH₵25', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80' },
      { id: 2, name: 'Ice Cream', price: 'GH₵15', image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
      { id: 3, name: 'Cheesecake', price: 'GH₵28', image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=400&q=80' },
      { id: 4, name: 'Brownie', price: 'GH₵20', image: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400&q=80' },
      { id: 5, name: 'Apple Pie', price: 'GH₵22', image: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&q=80' },
      { id: 6, name: 'Donut Box', price: 'GH₵30', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=80' },
    ],
  };

  const products = categoryProducts[category.toLowerCase()] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Categories activeCategory={category} />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 mb-20 md:mb-0">
        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedProduct({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  category: categoryName,
                })}
              >
                {/* Image */}
                <div className="relative h-40 bg-gray-100 rounded-xl overflow-hidden shadow-lg mb-3 group">
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
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No products found in this category.</p>
          </div>
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
