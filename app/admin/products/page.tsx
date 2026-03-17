'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Product = {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  description: string | null;
  isFeatured: boolean;
};

type Toast = {
  type: 'success' | 'error';
  message: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load products');

      const payload = (await response.json()) as Product[];
      setProducts(payload);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load products' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const totalProducts = products.length;
  const featuredCount = useMemo(() => products.filter(product => product.isFeatured).length, [products]);

  const deleteProduct = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return;

    try {
      setDeletingId(product.id);
      const response = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Failed to delete product');
      }

      setProducts(prev => prev.filter(item => item.id !== product.id));
      setToast({ type: 'success', message: `${product.name} deleted.` });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete product' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Products</h1>
            <p className="mt-1 text-sm text-slate-600">Product details with direct actions for edit, delete, and update.</p>
          </div>
          <Link
            href="/admin/products/new"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Add Product
          </Link>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Products</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{totalProducts}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Featured</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{featuredCount}</p>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          {loading ? (
            <div className="p-5 text-slate-600">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-5 text-slate-600">No products found.</div>
          ) : (
            <table className="w-full min-w-[980px] bg-white">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => {
                  return (
                    <tr key={product.id} className="border-t border-slate-100 text-sm transition-colors hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                          />
                          <p className="font-bold text-slate-900">{product.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{product.category}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{product.price}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.isFeatured ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {product.isFeatured ? 'Featured' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Preview
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-100"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => void deleteProduct(product)}
                            disabled={deletingId === product.id}
                            className="rounded-lg bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === product.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
