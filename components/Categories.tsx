'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Category = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

interface CategoriesProps {
  activeCategory?: string;
}

export default function Categories({ activeCategory }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);

  const cardStyles = [
    'bg-[radial-gradient(circle_at_top_left,_#fb7185,_#be123c_55%,_#881337)]',
    'bg-[radial-gradient(circle_at_top_right,_#f472b6,_#db2777_55%,_#831843)]',
    'bg-[radial-gradient(circle_at_bottom_left,_#fda4af,_#e11d48_50%,_#9f1239)]',
    'bg-[radial-gradient(circle_at_top,_#fecdd3,_#f43f5e_45%,_#881337)]',
    'bg-[radial-gradient(circle_at_bottom_right,_#f9a8d4,_#ec4899_55%,_#9d174d)]',
  ];

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as Category[];
        setCategories(payload);
      } catch {
        setCategories([]);
      }
    };

    void loadCategories();
  }, []);

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="bg-white py-6 md:py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {!activeCategory && (
          <div className="mb-5 md:mb-7">
            <h2 className="text-2xl font-black text-gray-900 md:text-3xl">Broswe by category</h2>
            <p className="mt-1 text-sm text-gray-600 md:text-base">Pick a category and explore available products.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category, index) => {
            const isActive = activeCategory?.toLowerCase() === category.name.toLowerCase();
            const bgStyle = cardStyles[index % cardStyles.length];
            const hasImage = Boolean(category.imageUrl);

            return (
              <Link
                key={category.id}
                href={`/menu/${encodeURIComponent(category.name)}`}
                className="group"
              >
                <div
                  className={`relative overflow-hidden rounded-2xl p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl md:p-5 ${bgStyle} ${
                    isActive ? 'ring-4 ring-pink-200' : 'ring-1 ring-transparent'
                  }`}
                  style={
                    hasImage
                      ? {
                          backgroundImage: `linear-gradient(rgba(20, 20, 35, 0.35), rgba(20, 20, 35, 0.55)), url(${category.imageUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : undefined
                  }
                >
                  {!hasImage && <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/15" />}
                  {!hasImage && <div className="absolute -bottom-8 -left-6 h-24 w-24 rounded-full bg-white/10" />}
                  <div className="relative z-10 flex h-24 flex-col justify-between md:h-28">
                    <div className="h-10 w-10 rounded-full bg-white/20 text-center text-lg font-black leading-10 text-white">
                      {category.name.slice(0, 1).toUpperCase()}
                    </div>
                    <h3 className="text-base font-black leading-tight text-white md:text-lg">{category.name}</h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
