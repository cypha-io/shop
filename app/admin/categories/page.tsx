'use client';

'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

type Category = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  createdAt: string;
};

type Toast = {
  type: 'success' | 'error';
  message: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newCategoryImageUrl, setNewCategoryImageUrl] = useState('');
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load categories');
      const payload = (await response.json()) as Category[];
      setCategories(payload);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load categories' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const addCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, imageUrl: newCategoryImageUrl.trim() || null }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Failed to add category');
      }

      const saved = (await response.json()) as Category;
      setCategories(prev => {
        const withoutDuplicate = prev.filter(item => item.id !== saved.id);
        return [...withoutDuplicate, saved].sort((a, b) => a.name.localeCompare(b.name));
      });
      setNewCategory('');
      setNewCategoryImageUrl('');
      setToast({ type: 'success', message: 'Category saved.' });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to add category' });
    } finally {
      setSaving(false);
    }
  };

  const uploadCategoryImage = async (file: File) => {
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

      setNewCategoryImageUrl(payload.url);
      setToast({ type: 'success', message: 'Category image uploaded.' });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Image upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;

    try {
      setDeletingId(category.id);
      const response = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Failed to delete category');
      }

      setCategories(prev => prev.filter(item => item.id !== category.id));
      setToast({ type: 'success', message: 'Category deleted.' });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete category' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl">
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
        <h1 className="text-3xl font-black text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-600">Add and manage product categories for the catalog.</p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="text-sm font-semibold text-slate-700">Category Name</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              value={newCategory}
              onChange={event => setNewCategory(event.target.value)}
              placeholder="e.g. Premium Wigs"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => void addCategory()}
              disabled={saving || uploading || !newCategory.trim()}
              className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Category'}
            </button>
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-700">Category Background Image</label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={event => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadCategoryImage(file);
                }
                event.target.value = '';
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={uploading}
              className="mt-3 rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            {uploading && <p className="mt-2 text-sm font-semibold text-slate-700">Uploading image...</p>}
            {newCategoryImageUrl && (
              <div className="mt-3">
                <Image src={newCategoryImageUrl} alt="Category preview" width={140} height={90} className="rounded-lg object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          {loading ? (
            <div className="p-5 text-slate-600">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-5 text-slate-600">No categories yet.</div>
          ) : (
            <table className="w-full min-w-[680px] bg-white">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.id} className="border-t border-slate-100 text-sm">
                    <td className="px-4 py-3 font-bold text-slate-900">{category.name}</td>
                    <td className="px-4 py-3 text-slate-700">{category.slug}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {category.imageUrl ? (
                        <Image src={category.imageUrl} alt={category.name} width={96} height={64} className="rounded-md object-cover" />
                      ) : (
                        'No image'
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{new Date(category.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void deleteCategory(category)}
                        disabled={deletingId === category.id}
                        className="rounded-lg bg-pink-100 px-3 py-2 text-xs font-semibold text-pink-700 disabled:opacity-50"
                      >
                        {deletingId === category.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
