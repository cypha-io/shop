'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiCamera, FiCheck, FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';

type ProductForm = {
  name: string;
  description: string;
  imageUrls: string[];
  regularPrice: string;
  salePrice: string;
  stock: string;
  category: string;
  isFeatured: boolean;
  hasVariations: boolean;
};

type VariationForm = {
  name: '' | 'Size' | 'Color' | 'Type';
  options: string[];
  customOptions: string[];
  customInput: string;
  regularPrice: string;
  salePrice: string;
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
  stock: '',
  category: '',
  isFeatured: false,
  hasVariations: false,
};

const VARIATION_OPTIONS: Record<'Size' | 'Color' | 'Type', string[]> = {
  Size: ['8 Inch', '10 Inch', '12 Inch', '14 Inch', '16 Inch', '18 Inch', '20 Inch', '22 Inch', '24 Inch'],
  Color: ['Black', 'Brown', 'Blonde', 'Burgundy', 'Ombre', 'Natural'],
  Type: ['Straight', 'Body Wave', 'Deep Wave', 'Curly', 'Kinky', 'Frontal', 'Closure'],
};

const inputCls =
  'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition placeholder:text-gray-400';

const selectCls =
  'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition appearance-none cursor-pointer';

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [variations, setVariations] = useState<VariationForm[]>([{ name: '', options: [], customOptions: [], customInput: '', regularPrice: '', salePrice: '' }]);
  const [toast, setToast] = useState<Toast | null>(null);

  const hasVariationPriceSet =
    form.hasVariations && variations.some(variation => variation.regularPrice.trim().length > 0 || variation.salePrice.trim().length > 0);

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
    const variationValid =
      !form.hasVariations ||
      variations.some(
        variation => variation.name && variation.options.length > 0 && variation.regularPrice.trim().length > 0
      );
    const hasBasePrice = form.regularPrice.trim().length > 0;

    return (
      form.name.trim().length > 0 &&
      form.description.trim().length > 0 &&
      form.imageUrls.length > 0 &&
      (hasBasePrice || hasVariationPriceSet) &&
      form.category.trim().length > 0 &&
      !uploading &&
      variationValid
    );
  }, [form, uploading, variations, hasVariationPriceSet]);

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
          regularPrice: hasVariationPriceSet ? '' : form.regularPrice.trim(),
          salePrice: hasVariationPriceSet ? '' : form.salePrice.trim(),
          stock: form.stock.trim() !== '' ? Number(form.stock) : null,
          category: (selectedCategory === '__custom__' ? customCategory : form.category).trim(),
          hasVariations: form.hasVariations,
          isFeatured: form.isFeatured,
          variations: form.hasVariations
            ? variations
                .filter(variation => variation.name && variation.options.length > 0)
                .map(variation => ({
                  name: variation.name,
                  options: variation.options,
                  regularPrice: variation.regularPrice.trim(),
                  salePrice: variation.salePrice.trim(),
                }))
            : [],
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
    <div className="mx-auto w-full max-w-2xl space-y-4 pb-12">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <FiCheck className="h-4 w-4" /> : null}
            {toast.message}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="mt-0.5 text-sm text-gray-500">Create a new product using the form below.</p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          ← Back
        </Link>
      </div>

      {/* Basic Information */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Basic Information</h2>
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            Product Name
            <input
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Brazilian Body Wave Wig"
              className={inputCls}
            />
          </label>

          <label className="block text-sm font-semibold text-gray-700">
            Category
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => {
                  const value = e.target.value;
                  setSelectedCategory(value);
                  if (value === '__custom__') {
                    setForm(prev => ({ ...prev, category: customCategory }));
                  } else {
                    const chosen = categories.find(c => String(c.id) === value);
                    setForm(prev => ({ ...prev, category: chosen?.name || '' }));
                  }
                }}
                className={selectCls}
              >
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
                <option value="__custom__">+ Custom category</option>
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </label>

          {selectedCategory === '__custom__' && (
            <label className="block text-sm font-semibold text-gray-700">
              Custom Category Name
              <input
                value={customCategory}
                onChange={e => {
                  setCustomCategory(e.target.value);
                  setForm(prev => ({ ...prev, category: e.target.value }));
                }}
                placeholder="Enter category name"
                className={inputCls}
              />
            </label>
          )}

          <label className="block text-sm font-semibold text-gray-700">
            Description
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Describe the product..."
              className={`${inputCls} resize-none`}
            />
          </label>
        </div>
      </div>

      {/* Pricing & Featured */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Pricing</h2>
          <label className="flex cursor-pointer items-center gap-2.5">
            <div className="relative">
              <input
                type="checkbox"
                value="featured"
                checked={form.isFeatured ?? false}
                onChange={e => setForm(prev => ({ ...prev, isFeatured: e.target.checked }))}
                className="sr-only"
              />
              <div className={`h-6 w-11 rounded-full transition ${form.isFeatured ? 'bg-orange-500' : 'bg-gray-200'}`} />
              <div
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.isFeatured ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {form.isFeatured ? 'Featured' : 'Not Featured'}
            </span>
          </label>
        </div>
        {hasVariationPriceSet && (
          <p className="mb-4 mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
            Pricing is controlled by variations below. Base prices are disabled.
          </p>
        )}
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-gray-700">
            Regular Price
            <input
              value={form.regularPrice}
              onChange={e => setForm(prev => ({ ...prev, regularPrice: e.target.value }))}
              placeholder="e.g. GH₵150"
              disabled={hasVariationPriceSet}
              className={`${inputCls} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            Sale Price
            <input
              value={form.salePrice}
              onChange={e => setForm(prev => ({ ...prev, salePrice: e.target.value }))}
              placeholder="Optional"
              disabled={hasVariationPriceSet}
              className={`${inputCls} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
            />
          </label>
        </div>
        <div className="mt-3">
          <label className="block text-sm font-semibold text-gray-700">
            Stock Quantity
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="Leave blank for unlimited"
              className={inputCls}
            />
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Product Images</h2>
            <p className="mt-0.5 text-xs text-gray-400">Up to 3 images. First image is the main.</p>
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={e => {
              const file = e.target.files?.[0];
              if (file) void uploadImage(file);
              e.target.value = '';
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading || form.imageUrls.length >= 3}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            <FiCamera className="h-4 w-4" />
            {uploading ? 'Uploading...' : form.imageUrls.length >= 3 ? 'Max reached' : 'Add Image'}
          </button>
        </div>
        {form.imageUrls.length > 0 ? (
          <div className="grid grid-cols-3 gap-3">
            {form.imageUrls.map((url, i) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100">
                <Image src={url} alt={`Uploaded product ${i + 1}`} fill className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                  <button
                    type="button"
                    onClick={() =>
                      setForm(prev => ({
                        ...prev,
                        imageUrls: prev.imageUrls.filter((_, idx) => idx !== i),
                      }))
                    }
                    className="scale-75 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 opacity-0 shadow transition group-hover:scale-100 group-hover:opacity-100"
                  >
                    <FiTrash2 className="mr-0.5 inline h-3 w-3" />
                    Remove
                  </button>
                </div>
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    Main
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={() => imageInputRef.current?.click()}
            className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition hover:border-orange-300 hover:text-orange-400"
          >
            <div className="text-center">
              <FiCamera className="mx-auto h-8 w-8" />
              <p className="mt-1 text-sm font-medium">Click to upload an image</p>
            </div>
          </div>
        )}
      </div>

      {/* Variations */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Variations</h2>
            <p className="mt-0.5 text-xs text-gray-400">Add sizes, colors, or types with individual pricing.</p>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.hasVariations}
                onChange={e => setForm(prev => ({ ...prev, hasVariations: e.target.checked }))}
                className="sr-only"
              />
              <div className={`h-6 w-11 rounded-full transition ${form.hasVariations ? 'bg-orange-500' : 'bg-gray-200'}`} />
              <div
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.hasVariations ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {form.hasVariations ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        {form.hasVariations && (
          <div className="mt-4 space-y-3">
            {hasVariationPriceSet && (
              <p className="rounded-lg border border-orange-50 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-600">
                Variation prices active — base product prices are disabled.
              </p>
            )}
            {variations.map((variation, i) => (
              <div key={`${variation.name}-${i}`} className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Variation {i + 1}</p>
                  {variations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setVariations(prev => prev.filter((_, idx) => idx !== i))}
                      className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      <FiTrash2 className="mr-0.5 inline h-3 w-3" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Variation Type</label>
                    <div className="relative">
                      <select
                        value={variation.name}
                        onChange={e =>
                          setVariations(prev =>
                            prev.map((row, idx) =>
                              idx === i ? { ...row, name: e.target.value as VariationForm['name'], options: [], customOptions: [], customInput: '' } : row
                            )
                          )
                        }
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
                      >
                        <option value="">Select type</option>
                        <option value="Size">Size</option>
                        <option value="Color">Color</option>
                        <option value="Type">Type</option>
                      </select>
                      <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Options</label>
                    {variation.name ? (
                      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 flex flex-wrap gap-x-4 gap-y-2">
                        {VARIATION_OPTIONS[variation.name].map(opt => (
                          <label key={opt} className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-800">
                            <input
                              type="checkbox"
                              checked={variation.options.includes(opt)}
                              onChange={e =>
                                setVariations(prev =>
                                  prev.map((row, idx) =>
                                    idx === i
                                      ? {
                                          ...row,
                                          options: e.target.checked
                                            ? [...row.options, opt]
                                            : row.options.filter(o => o !== opt),
                                        }
                                      : row
                                  )
                                )
                              }
                              className="accent-orange-500 h-4 w-4 cursor-pointer"
                            />
                            {opt}
                          </label>
                        ))}
                        {variation.customOptions.map(opt => (
                          <label key={opt} className="flex items-center gap-1.5 cursor-pointer select-none text-sm text-gray-800">
                            <input
                              type="checkbox"
                              checked={variation.options.includes(opt)}
                              onChange={e =>
                                setVariations(prev =>
                                  prev.map((row, idx) =>
                                    idx === i
                                      ? {
                                          ...row,
                                          options: e.target.checked
                                            ? [...row.options, opt]
                                            : row.options.filter(o => o !== opt),
                                        }
                                      : row
                                  )
                                )
                              }
                              className="accent-orange-500 h-4 w-4 cursor-pointer"
                            />
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setVariations(prev =>
                                  prev.map((row, idx) =>
                                    idx === i
                                      ? { ...row, customOptions: row.customOptions.filter(o => o !== opt), options: row.options.filter(o => o !== opt) }
                                      : row
                                  )
                                )
                              }
                              className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors leading-none"
                              aria-label={`Remove ${opt}`}
                            >
                              ×
                            </button>
                          </label>
                        ))}
                        <div className="w-full flex gap-2 mt-1 pt-2 border-t border-gray-100">
                          <input
                            value={variation.customInput}
                            onChange={e =>
                              setVariations(prev =>
                                prev.map((row, idx) => idx === i ? { ...row, customInput: e.target.value } : row)
                              )
                            }
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = variation.customInput.trim();
                                if (val && !variation.customOptions.includes(val) && !VARIATION_OPTIONS[variation.name as 'Size' | 'Color' | 'Type']?.includes(val)) {
                                  setVariations(prev =>
                                    prev.map((row, idx) =>
                                      idx === i
                                        ? { ...row, customOptions: [...row.customOptions, val], options: [...row.options, val], customInput: '' }
                                        : row
                                    )
                                  );
                                }
                              }
                            }}
                            placeholder="Add custom option…"
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const val = variation.customInput.trim();
                              if (val && !variation.customOptions.includes(val) && !VARIATION_OPTIONS[variation.name as 'Size' | 'Color' | 'Type']?.includes(val)) {
                                setVariations(prev =>
                                  prev.map((row, idx) =>
                                    idx === i
                                      ? { ...row, customOptions: [...row.customOptions, val], options: [...row.options, val], customInput: '' }
                                      : row
                                  )
                                );
                              }
                            }}
                            disabled={!variation.customInput.trim() || variation.customOptions.includes(variation.customInput.trim()) || VARIATION_OPTIONS[variation.name as 'Size' | 'Color' | 'Type']?.includes(variation.customInput.trim())}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-40 transition"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
                        Select a variation type first
                      </div>
                    )}
                    {variation.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {variation.options.map(opt => (
                          <span
                            key={opt}
                            className="inline-flex items-center rounded-full border border-orange-50 bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-500"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-gray-600">
                    Regular Price
                    <input
                      value={variation.regularPrice}
                      onChange={e =>
                        setVariations(prev =>
                          prev.map((row, idx) => (idx === i ? { ...row, regularPrice: e.target.value } : row))
                        )
                      }
                      placeholder="e.g. GH₵200"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-gray-600">
                    Sale Price
                    <input
                      value={variation.salePrice}
                      onChange={e =>
                        setVariations(prev =>
                          prev.map((row, idx) => (idx === i ? { ...row, salePrice: e.target.value } : row))
                        )
                      }
                      placeholder="Optional"
                      className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </label>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setVariations(prev => [...prev, { name: '', options: [], customOptions: [], customInput: '', regularPrice: '', salePrice: '' }])
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-orange-100 py-3 text-sm font-semibold text-orange-500 transition hover:border-orange-300 hover:bg-orange-50"
            >
              <FiPlus className="h-4 w-4" />
              Add Another Variation
            </button>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center justify-end rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={() => void createProduct()}
          disabled={saving || !canSubmit}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Adding...
            </>
          ) : (
            <>
              <FiCheck className="h-4 w-4" />
              Add Product
            </>
          )}
        </button>
      </div>
    </div>
  );
}
