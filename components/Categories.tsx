'use client';

import Link from 'next/link';

const categories = [
  { 
    name: 'Pizza', 
    image: '🍕',
    href: '/menu/pizza' 
  },
  { 
    name: 'Chicken', 
    image: '🍗',
    href: '/menu/chicken' 
  },
  { 
    name: 'Sides', 
    image: '🍔',
    href: '/menu/sides' 
  },
  { 
    name: 'Packages', 
    image: '📦',
    href: '/menu/packages' 
  },
  { 
    name: 'Drinks', 
    image: '🥤',
    href: '/menu/drinks' 
  },
  { 
    name: 'Desserts', 
    image: '🍰',
    href: '/menu/desserts' 
  },
];

interface CategoriesProps {
  activeCategory?: string;
}

export default function Categories({ activeCategory }: CategoriesProps) {
  return (
    <section className="py-3 md:py-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto gap-2 md:gap-3 px-3 md:px-6 pb-2 scrollbar-hide scroll-smooth">
          {categories.map((category) => {
            const isActive = activeCategory?.toLowerCase() === category.name.toLowerCase();
            return (
              <Link 
                key={category.name}
                href={category.href}
                className="group flex-shrink-0"
              >
                <div className={`rounded-lg md:rounded-xl p-2 md:p-3 hover:scale-105 transition-transform shadow-md hover:shadow-lg flex items-center gap-1.5 md:gap-2 min-w-[110px] md:min-w-[140px] ${
                  isActive 
                    ? 'bg-yellow-400 text-gray-900' 
                    : 'bg-red-600 text-white'
                }`}>
                  <div className="text-xl md:text-2xl flex-shrink-0">
                    {category.image}
                  </div>
                  <h3 className={`text-sm md:text-base font-black whitespace-nowrap ${
                    isActive ? 'text-gray-900' : 'text-white'
                  }`}>{category.name}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
