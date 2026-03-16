import { useState, useEffect } from 'react';
import { appReady } from '@/lib/appReady';

interface Product {
  id: number;
  name: string;
  price: string;
  regularPrice?: string | null;
  salePrice?: string | null;
  image: string;
  category: string;
  description?: string;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface UseProductsOptions {
  category?: string;
  featured?: boolean;
  limit?: number;
}

// Module-level cache — persists for the entire browser session.
// Key: endpoint URL string.
const productCache = new Map<string, Product[]>();

/** Fetch and cache a single endpoint. Signals appReady so SplashScreen can track it. */
export async function prefetchProducts(endpoint: string): Promise<void> {
  if (productCache.has(endpoint)) return;
  appReady.startLoad();
  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Product[] = await res.json();
    productCache.set(endpoint, data);
  } catch {
    // silently ignore prefetch failures
  } finally {
    appReady.endLoad();
  }
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { category, featured, limit } = options;

  const buildEndpoint = () => {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (featured !== undefined) query.set('featured', String(featured));
    if (limit !== undefined) query.set('limit', String(limit));
    const qs = query.toString();
    return qs ? `/api/products?${qs}` : '/api/products';
  };

  const getFromCache = (): Product[] | null => {
    const endpoint = buildEndpoint();
    if (productCache.has(endpoint)) return productCache.get(endpoint)!;
    // If only category filter and we have the full list, derive from that
    if (category && !featured && !limit && productCache.has('/api/products')) {
      return productCache.get('/api/products')!.filter(
        p => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    return null;
  };

  const cached = getFromCache();
  const [products, setProducts] = useState<Product[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fromCache = getFromCache();
    if (fromCache !== null) {
      setProducts(fromCache);
      setLoading(false);
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadProducts = async () => {
      appReady.startLoad();
      try {
        setLoading(true);
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 10000);

        const endpoint = buildEndpoint();
        const response = await fetch(endpoint, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data: Product[] = await response.json();
        productCache.set(endpoint, data);

        if (isMounted) {
          setProducts(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      } finally {
        appReady.endLoad();
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, featured, limit]);

  return { products, loading, error };
};
