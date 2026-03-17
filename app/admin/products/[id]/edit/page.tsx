'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FiCamera, FiCheck, FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';

type ProductForm = {
  name: string;
  category: string;
  regularPrice: string;
  salePrice: string;
  imageUrls: string[];
  description: string;
  isFeatured: boolean;
  hasVariations: boolean;
};

type VariationForm = {
  name: '' | 'Size' | 'Color' | 'Type';
  options: string[];
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

const VARIATION_OPTIONS: Record<'Size' | 'Color' | 'Type', string[]> = {
  Size: ['8 Inch', '10 Inch', '12 Inch', '14 Inch', '16 Inch', '18 Inch', '20 Inch', '22 Inch', '24 Inch'],
  Color: ['Black', 'Brown', 'Blonde', 'Burgundy', 'Ombre', 'Natural'],
  Type: ['Straight', 'Body Wave', 'Deep Wave', 'Curly', 'Kinky', 'Frontal', 'Closure'],
};

const inputCls =
  'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition placeholder:text-gray-400';

const selectCls =
  'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition appearance-none cursor-pointer';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState<ProductForm | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [originalSignature, setOriginalSignature] = useState('');
  const [variations, setVariations] = useState<VariationForm[]>([
    { name: '', options: [], regularPrice: '', salePrice: '' },
  ]);
  const [originalVariationsSignature, setOriginalVariationsSignature] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const productId = Number(params.id);

  const hasVariationPriceSet =
    form?.hasVariations === true &&
    variations.some(v => v.regularPrice.trim().length > 0 || v.salePrice.trim().length > 0);

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
          hasVariations: boolean;
          variations?: Array<{ name: string; option: string; regularPrice?: string; salePrice?: string }> | null;
        };

        const nextForm: ProductForm = {
          name: payload.name,
          category: payload.category,
          regularPrice: payload.regularPrice || payload.price || '',
          salePrice: payload.salePrice || '',
          imageUrls: Array.isArray(payload.imageUrls) && payload.imageUrls.length > 0 ? payload.imageUrls.slice(0, 3) : [payload.image],
          description: payload.description || '',
          isFeatured: Boolean(payload.isFeatured),
          hasVariations: Boolean(payload.hasVariations),
        };

        setForm(nextForm);
        setCustomCategory(nextForm.category);
        setOriginalSignature(JSON.stringify(nextForm));

        if (Array.isArray(payload.variations) && payload.variations.length > 0) {
          const grouped = new Map<string, VariationForm>();
          for (const v of payload.variations) {
            if (!grouped.has(v.name)) {
              grouped.set(v.name, {
                name: v.name as VariationForm['name'],
                options: [],
                regularPrice: v.regularPrice || '',
                salePrice: v.salePrice || '',
              });
            }
            const row = grouped.get(v.name)!;
            if (v.option && !row.options.includes(v.option)) {
              row.options.push(v.option);
            }
          }
          const loadedVariations = Array.from(grouped.values());
          setVariations(loadedVariations);
          setOriginalVariationsSignature(JSON.stringify(loadedVariations));
        }
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
  const currentVariationsSignature = useMemo(() => JSON.stringify(variations), [variations]);
  const hasChanges =
    currentSignature !== originalSignature ||
    currentVariationsSignature !== originalVariationsSignature;

  const canSubmit = useMemo(() => {
    if (!form) return false;
    const variationValid =
      !form.hasVariations ||
      variations.some(v => v.name && v.options.length > 0 && v.regularPrice.trim().length > 0);
    const hasBasePrice = form.regularPrice.trim().length > 0;
    return (
      form.name.trim().length > 0 &&
      form.category.trim().length > 0 &&
      form.imageUrls.length > 0 &&
      (hasBasePrice || hasVariationPriceSet) &&
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
          regularPrice: hasVariationPriceSet ? '' : form.regularPrice.trim(),
          salePrice: hasVariationPriceSet ? '' : form.salePrice.trim(),
          hasVariations: form.hasVariations,
          variations: form.hasVariations
            ? variations
                .filter(v => v.name && v.options.length > 0)
                .map(v => ({
                  name: v.name,
                  options: v.options,
                  regularPrice: v.regularPrice.trim(),
                  salePrice: v.salePrice.trim(),
                }))
            : [],
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; details?: string };
        throw new Error(payload.error || payload.details || 'Failed to update product');
      }

      setOriginalSignature(JSON.stringify(form));
      setOriginalVariationsSignature(JSON.stringify(variations));
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
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="mt-0.5 text-sm text-gray-500">Update product details and save changes.</p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          ← Back
        </Link>
      </div>

      {loading || !form ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
          <p className="mt-3 text-sm text-gray-500">Loading product...</p>
        </div>
      ) : (
        <>
          {/* Basic Information */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Basic Information</h2>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">
                Product Name
                <input
                  value={form.name}
                  onChange={e => setForm(prev => (prev ? { ...prev, name: e.target.value } : prev))}
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
                        setForm(prev => (prev ? { ...prev, category: customCategory } : prev));
                      } else {
                        const chosen = categories.find(c => String(c.id) === value);
                        setForm(prev => (prev ? { ...prev, category: chosen?.name || '' } : prev));
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
                      setForm(prev => (prev ? { ...prev, category: e.target.value } : prev));
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
                  onChange={e => setForm(prev => (prev ? { ...prev, description: e.target.value } : prev))}
                  rows={4}
                  placeholder="Describe the product..."
                  className={`${inputCls} resize-none`}
                />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Pricing</h2>
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
                  onChange={e => setForm(prev => (prev ? { ...prev, regularPrice: e.target.value } : prev))}
                  disabled={hasVariationPriceSet}
                  placeholder="e.g. GH₵150"
                  className={`${inputCls} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
                />
              </label>
              <label className="block text-sm font-semibold text-gray-700">
                Sale Price
                <input
                  value={form.salePrice}
                  onChange={e => setForm(prev => (prev ? { ...prev, salePrice: e.target.value } : prev))}
                  disabled={hasVariationPriceSet}
                  placeholder="Optional"
                  className={`${inputCls} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400`}
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
                className="flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:opacity-50"
              >
                <FiCamera className="h-4 w-4" />
                {uploading ? 'Uploading...' : form.imageUrls.length >= 3 ? 'Max reached' : 'Add Image'}
              </button>
            </div>
            {form.imageUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {form.imageUrls.map((url, i) => (
                  <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100">
                    <Image src={url} alt={`Product image ${i + 1}`} fill className="object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                      <button
                        type="button"
                        onClick={() =>
                          setForm(prev =>
                            prev ? { ...prev, imageUrls: prev.imageUrls.filter((_, idx) => idx !== i) } : prev
                          )
                        }
                        className="scale-75 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 opacity-0 shadow transition group-hover:scale-100 group-hover:opacity-100"
                      >
                        <FiTrash2 className="mr-0.5 inline h-3 w-3" />
                        Remove
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 rounded bg-pink-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition hover:border-pink-400 hover:text-pink-500"
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
                    onChange={e => setForm(prev => (prev ? { ...prev, hasVariations: e.target.checked } : prev))}
                    className="sr-only"
                  />
                  <div className={`h-6 w-11 rounded-full transition ${form.hasVariations ? 'bg-pink-600' : 'bg-gray-200'}`} />
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
                  <p className="rounded-lg border border-pink-100 bg-pink-50 px-3 py-2 text-xs font-medium text-pink-700">
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
                                  idx === i ? { ...row, name: e.target.value as VariationForm['name'], options: [] } : row
                                )
                              )
                            }
                            className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer"
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
                        <label className="mb-1 block text-xs font-semibold text-gray-600">
                          Options{' '}
                          {variation.name && <span className="font-normal text-gray-400">(hold Ctrl/⌘ for multiple)</span>}
                        </label>
                        <select
                          multiple
                          value={variation.options}
                          onChange={e =>
                            setVariations(prev =>
                              prev.map((row, idx) =>
                                idx === i
                                  ? { ...row, options: Array.from(e.target.selectedOptions).map(o => o.value) }
                                  : row
                              )
                            )
                          }
                          disabled={!variation.name}
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-50 disabled:text-gray-400"
                          size={4}
                        >
                          {variation.name
                            ? VARIATION_OPTIONS[variation.name].map(opt => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))
                            : null}
                        </select>
                        {variation.options.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {variation.options.map(opt => (
                              <span
                                key={opt}
                                className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2.5 py-0.5 text-xs font-semibold text-pink-700"
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
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
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
                          className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </label>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setVariations(prev => [...prev, { name: '', options: [], regularPrice: '', salePrice: '' }])
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-pink-200 py-3 text-sm font-semibold text-pink-600 transition hover:border-pink-400 hover:bg-pink-50"
                >
                  <FiPlus className="h-4 w-4" />
                  Add Another Variation
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Settings</h2>
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => setForm(prev => (prev ? { ...prev, isFeatured: e.target.checked } : prev))}
                  className="sr-only"
                />
                <div className={`h-6 w-11 rounded-full transition ${form.isFeatured ? 'bg-pink-600' : 'bg-gray-200'}`} />
                <div
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.isFeatured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Featured product</p>
                <p className="text-xs text-gray-400">Show this product in featured sections.</p>
              </div>
            </label>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-400">
              {hasChanges ? 'You have unsaved changes.' : 'No changes to save.'}
            </p>
            <button
              type="button"
              onClick={() => void updateProduct()}
              disabled={saving || !canSubmit || !hasChanges}
              className="flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <FiCheck className="h-4 w-4" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
