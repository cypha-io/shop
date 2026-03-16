'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type ProductForm = {
  name: string;
  description: string;
  imageUrls: string[];
  regularPrice: string;
  salePrice: string;
  category: string;
  hasVariations: boolean;
};

type VariationForm = {
  name: string;
  option: string;
  additionalPrice: string;
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

const INITIAL_FORM: ProductForm = {
  name: '',
  description: '',
  imageUrls: [],
  regularPrice: '',
  salePrice: '',
  category: '',
  hasVariations: false,
};

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [variations, setVariations] = useState<VariationForm[]>([{ name: '', option: '', additionalPrice: '' }]);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3000);
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

  const canSubmit = useMemo(() => {
    const variationValid = !form.hasVariations || variations.some(variation => variation.name.trim() && variation.option.trim());

    return (
      form.name.trim().length > 0 &&
      form.description.trim().length > 0 &&
      form.imageUrls.length > 0 &&
      form.regularPrice.trim().length > 0 &&
      form.category.trim().length > 0 &&
      !uploading &&
      variationValid
    );
  }, [form, uploading, variations]);

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
        if (!payload.url) return prev;
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

  const createProduct = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          image: form.imageUrls[0],
          imageUrls: form.imageUrls,
          regularPrice: form.regularPrice.trim(),
          salePrice: form.salePrice.trim(),
          category: (selectedCategory === '__custom__' ? customCategory : form.category).trim(),
          hasVariations: form.hasVariations,
          variations: form.hasVariations
            ? variations
                .filter(variation => variation.name.trim() && variation.option.trim())
                .map(variation => ({
                  name: variation.name.trim(),
                  option: variation.option.trim(),
                  additionalPrice: variation.additionalPrice.trim() || '0',
                }))
            : [],
          isFeatured: false,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; details?: string };
        throw new Error(payload.error || payload.details || 'Failed to create product');
      }

      setToast({ type: 'success', message: 'Product created successfully.' });
      window.setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 600);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to create product' });
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
            <h1 className="text-3xl font-black text-slate-900">Add Product</h1>
            <p className="mt-1 text-sm text-slate-600">Create a product using the required admin form.</p>
          </div>
          <Link href="/admin/products" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            Back to Products
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Name
            <input
              value={form.name}
              onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
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
                  setForm(prev => ({ ...prev, category: customCategory }));
                } else {
                  const chosen = categories.find(category => String(category.id) === value);
                  const name = chosen?.name || '';
                  setForm(prev => ({ ...prev, category: name }));
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
              onChange={event => setForm(prev => ({ ...prev, regularPrice: event.target.value }))}
              placeholder="e.g. GH₵150"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Price (Sale)
            <input
              value={form.salePrice}
              onChange={event => setForm(prev => ({ ...prev, salePrice: event.target.value }))}
              placeholder="Optional"
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
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
                setForm(prev => ({ ...prev, category: value }));
              }}
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
        )}

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Description
          <textarea
            value={form.description}
            onChange={event => setForm(prev => ({ ...prev, description: event.target.value }))}
            rows={4}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-700">Image Upload (Up to 3)</p>
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
            className="mt-3 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : form.imageUrls.length >= 3 ? 'Maximum Reached' : 'Upload Image'}
          </button>
          {uploading && <p className="mt-2 text-sm font-semibold text-slate-700">Uploading image...</p>}
          {form.imageUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3">
              {form.imageUrls.map((url, index) => (
                <div key={url} className="relative">
                  <Image src={url} alt={`Uploaded product ${index + 1}`} width={128} height={128} className="rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        imageUrls: prev.imageUrls.filter((_, imageIndex) => imageIndex !== index),
                      }))
                    }
                    className="absolute right-1 top-1 rounded bg-white/90 px-2 py-1 text-xs font-semibold text-pink-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.hasVariations}
            onChange={event => setForm(prev => ({ ...prev, hasVariations: event.target.checked }))}
          />
          Variation
        </label>

        {form.hasVariations && (
          <div className="mt-4 rounded-xl border border-pink-100 bg-pink-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold text-pink-700">Variation Form</p>
              <button
                type="button"
                onClick={() => setVariations(prev => [...prev, { name: '', option: '', additionalPrice: '' }])}
                className="rounded-lg bg-pink-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-pink-700"
              >
                Add Variation Row
              </button>
            </div>

            <div className="space-y-3">
              {variations.map((variation, index) => (
                <div key={`${variation.name}-${variation.option}-${index}`} className="grid gap-3 rounded-lg border border-pink-100 bg-white p-3 md:grid-cols-3">
                  <input
                    value={variation.name}
                    onChange={event =>
                      setVariations(prev => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, name: event.target.value } : row)))
                    }
                    placeholder="Variation name (e.g. Size)"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    value={variation.option}
                    onChange={event =>
                      setVariations(prev => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, option: event.target.value } : row)))
                    }
                    placeholder="Option (e.g. 14 Inch)"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      value={variation.additionalPrice}
                      onChange={event =>
                        setVariations(prev => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, additionalPrice: event.target.value } : row)))
                      }
                      placeholder="Additional price"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setVariations(prev => (prev.length === 1 ? prev : prev.filter((_, rowIndex) => rowIndex !== index)))}
                      className="rounded-lg bg-pink-100 px-3 py-2 text-xs font-semibold text-pink-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => void createProduct()}
            disabled={saving || !canSubmit}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </div>
    </section>
  );
}
