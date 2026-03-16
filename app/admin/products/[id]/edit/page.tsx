'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type ProductForm = {
  name: string;
  category: string;
  regularPrice: string;
  salePrice: string;
  imageUrls: string[];
  description: string;
  isFeatured: boolean;
};

type Toast = {
  type: 'success' | 'error';
  message: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<ProductForm | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [originalSignature, setOriginalSignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const productId = Number(params.id);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load categories');
        const payload = (await response.json()) as Category[];
        setCategories(payload);
      } catch {
        // Keep form usable even if categories endpoint fails.
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!Number.isInteger(productId) || productId <= 0) {
        setToast({ type: 'error', message: 'Invalid product id.' });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`, { cache: 'no-store' });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error || 'Failed to load product');
        }

        const payload = (await response.json()) as {
          name: string;
          category: string;
          price: string;
          regularPrice: string | null;
          salePrice: string | null;
          image: string;
          imageUrls?: string[] | null;
          description: string | null;
          isFeatured: boolean;
        };

        const nextForm: ProductForm = {
          name: payload.name,
          category: payload.category,
          regularPrice: payload.regularPrice || payload.price || '',
          salePrice: payload.salePrice || '',
          imageUrls: Array.isArray(payload.imageUrls) && payload.imageUrls.length > 0 ? payload.imageUrls.slice(0, 3) : [payload.image],
          description: payload.description || '',
          isFeatured: Boolean(payload.isFeatured),
        };

        setForm(nextForm);
        setCustomCategory(nextForm.category);
        setOriginalSignature(JSON.stringify(nextForm));
      } catch (err) {
        setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load product' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [productId]);

  useEffect(() => {
    if (!form) return;

    const matched = categories.find(category => category.name.toLowerCase() === form.category.toLowerCase());
    if (matched) {
      setSelectedCategory(String(matched.id));
    } else if (form.category.trim()) {
      setSelectedCategory('__custom__');
      setCustomCategory(form.category);
    } else {
      setSelectedCategory('');
    }
  }, [categories, form]);

  const currentSignature = useMemo(() => (form ? JSON.stringify(form) : ''), [form]);
  const hasChanges = currentSignature !== originalSignature;

  const canSubmit = useMemo(() => {
    if (!form) return false;
    return (
      form.name.trim().length > 0 &&
      form.category.trim().length > 0 &&
      form.regularPrice.trim().length > 0 &&
      form.imageUrls.length > 0 &&
      !uploading
    );
  }, [form, uploading]);

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);

      const data = new FormData();
      data.append('file', file);

      const response = await fetch('/api/uploads/product-image', {
        method: 'POST',
        body: data,
      });

      const payload = (await response.json()) as { url?: string; error?: string; details?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || payload.details || 'Image upload failed');
      }

      setForm(prev => {
        if (!prev || !payload.url) return prev;
        const withoutDuplicate = prev.imageUrls.filter(url => url !== payload.url);
        return { ...prev, imageUrls: [...withoutDuplicate, payload.url].slice(0, 3) };
      });
      setToast({ type: 'success', message: 'Image uploaded as WebP successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Image upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const updateProduct = async () => {
    if (!form) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          image: form.imageUrls[0],
          imageUrls: form.imageUrls,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; details?: string };
        throw new Error(payload.error || payload.details || 'Failed to update product');
      }

      setOriginalSignature(JSON.stringify(form));
      setToast({ type: 'success', message: 'Product updated successfully.' });
      window.setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 500);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update product' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`rounded-lg px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-pink-600 text-white'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Edit Product</h1>
            <p className="mt-1 text-sm text-slate-600">Update product details and save changes.</p>
          </div>
          <Link href="/admin/products" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Back to Products
          </Link>
        </div>

        {loading || !form ? (
          <div className="mt-6 text-slate-600">Loading product...</div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Name
                <input
                  value={form.name}
                  onChange={event => setForm(prev => (prev ? { ...prev, name: event.target.value } : prev))}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Category
                <select
                  value={selectedCategory}
                  onChange={event => {
                    const value = event.target.value;
                    setSelectedCategory(value);

                    if (value === '__custom__') {
                      setForm(prev => (prev ? { ...prev, category: customCategory } : prev));
                    } else {
                      const chosen = categories.find(category => String(category.id) === value);
                      const name = chosen?.name || '';
                      setForm(prev => (prev ? { ...prev, category: name } : prev));
                    }
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                  ))}
                  <option value="__custom__">Custom category</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Price (Regular)
                <input
                  value={form.regularPrice}
                  onChange={event => setForm(prev => (prev ? { ...prev, regularPrice: event.target.value } : prev))}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Price (Sale)
                <input
                  value={form.salePrice}
                  onChange={event => setForm(prev => (prev ? { ...prev, salePrice: event.target.value } : prev))}
                  placeholder="Optional"
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Image Upload (Up to 3)
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={event => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadImage(file);
                    }
                    event.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploading || form.imageUrls.length >= 3}
                  className="mt-2 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : form.imageUrls.length >= 3 ? 'Maximum Reached' : 'Upload Image'}
                </button>
                {uploading && <p className="mt-2 text-sm font-semibold text-slate-700">Uploading image...</p>}
                {form.imageUrls.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {form.imageUrls.map((url, index) => (
                      <div key={url} className="relative">
                        <Image src={url} alt={`Product image ${index + 1}`} width={128} height={128} className="rounded-lg object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setForm(prev =>
                              prev
                                ? {
                                    ...prev,
                                    imageUrls: prev.imageUrls.filter((_, imageIndex) => imageIndex !== index),
                                  }
                                : prev
                            )
                          }
                          className="absolute right-1 top-1 rounded bg-white/90 px-2 py-1 text-xs font-semibold text-pink-700"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </label>
            </div>

            {selectedCategory === '__custom__' && (
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Custom Category
                <input
                  value={customCategory}
                  onChange={event => {
                    const value = event.target.value;
                    setCustomCategory(value);
                    setForm(prev => (prev ? { ...prev, category: value } : prev));
                  }}
                  className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
            )}

            <label className="mt-4 block text-sm font-semibold text-slate-700">
              Description
              <textarea
                value={form.description}
                onChange={event => setForm(prev => (prev ? { ...prev, description: event.target.value } : prev))}
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            <label className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={event => setForm(prev => (prev ? { ...prev, isFeatured: event.target.checked } : prev))}
              />
              Featured product
            </label>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => void updateProduct()}
                disabled={saving || !canSubmit || !hasChanges}
                className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
