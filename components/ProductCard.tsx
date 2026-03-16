'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiShoppingCart } from 'react-icons/fi';

type ProductCardItem = {
  id: number | string;
  name: string;
  price: string;
  image: string;
  category?: string;
};

type ProductCardProps = {
  product: ProductCardItem;
  href?: string;
  size?: 'default' | 'compact';
  showCategory?: boolean;
  showViewLabel?: boolean;
};

export default function ProductCard({
  product,
  href,
  size = 'default',
  showCategory = true,
  showViewLabel = true,
}: ProductCardProps) {
  const cardHref = href ?? `/products/${product.id}`;
  const isCompact = size === 'compact';

  return (
    <Link href={cardHref} className="group block">
      <div
        className={`relative bg-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-xl transition-shadow mb-4 ${
          isCompact ? 'h-40' : 'h-56'
        }`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {showCategory && product.category ? (
          <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-800">
            {product.category}
          </span>
        ) : null}

        <span className="absolute top-2 right-2 w-10 h-10 bg-pink-400 rounded-full flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-lg">
          <FiShoppingCart className="text-gray-900 text-lg" />
        </span>
      </div>

      <div className="text-center">
        <h3 className={`font-bold text-gray-800 mb-2 ${isCompact ? 'text-sm' : 'text-base mb-3'}`}>{product.name}</h3>
        <div className={`bg-pink-600 rounded-lg inline-block ${isCompact ? 'px-3 py-1.5' : 'px-4 py-2 mb-2'}`}>
          <p className={`text-white font-black ${isCompact ? 'text-sm' : 'text-base'}`}>{product.price}</p>
        </div>
        {showViewLabel ? <p className="text-sm text-pink-600 font-semibold mt-2">View details</p> : null}
      </div>
    </Link>
  );
}
