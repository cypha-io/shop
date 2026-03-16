import { useState, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products', { cache: 'no-store' });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data: Product[] = await response.json();
        
        if (isMounted) {
          setProducts(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return { products, loading, error };
};
