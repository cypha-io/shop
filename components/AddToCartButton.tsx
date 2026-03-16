'use client';

import { useState } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { addToCart } from '@/hooks/useCart';

type AddToCartButtonProps = {
  product: {
    id: number;
    name: string;
    price: string;
    image: string;
    category?: string;
  };
  className?: string;
};

export default function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <button
      onClick={onAdd}
      className={className ?? 'inline-flex items-center justify-center gap-3 rounded-xl bg-pink-600 px-6 py-4 text-white font-bold hover:bg-pink-700 transition-colors'}
      type="button"
    >
      <FiShoppingCart className="text-lg" />
      {added ? 'Added' : 'Add to cart'}
    </button>
  );
}
