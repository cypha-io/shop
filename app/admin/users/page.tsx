'use client';

import { useEffect, useState } from 'react';

type UserRow = {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  role: 'user' | 'admin';
  createdAt: string;
};

type SaveState = Record<number, boolean>;
type Toast = {
  type: 'success' | 'error';
  message: string;
};

type UserSnapshot = {
  fullName: string;
  role: 'user' | 'admin';
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [originalUsers, setOriginalUsers] = useState<Record<number, UserSnapshot>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SaveState>({});
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/users', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load users');
        const payload = (await response.json()) as UserRow[];
        setUsers(payload);

        const nextOriginals: Record<number, UserSnapshot> = {};
        for (const user of payload) {
          nextOriginals[user.id] = {
            fullName: user.fullName.trim(),
            role: user.role,
          };
        }
        setOriginalUsers(nextOriginals);
      } catch (err) {
        setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load users' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const updateRow = (id: number, patch: Partial<UserRow>) => {
    setUsers(prev => prev.map(user => (user.id === id ? { ...user, ...patch } : user)));
  };

  const saveUser = async (user: UserRow) => {
    try {
      setSaving(prev => ({ ...prev, [user.id]: true }));

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, fullName: user.fullName, role: user.role }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Failed to update user');
      }

      const updated = (await response.json()) as UserRow;
      updateRow(user.id, {
        fullName: updated.fullName,
        role: updated.role,
      });
      setOriginalUsers(prev => ({
        ...prev,
        [user.id]: {
          fullName: updated.fullName.trim(),
          role: updated.role,
        },
      }));
      setToast({ type: 'success', message: 'User updated successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update user' });
    } finally {
      setSaving(prev => ({ ...prev, [user.id]: false }));
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const hasUserChanges = (user: UserRow) => {
    const original = originalUsers[user.id];
    if (!original) return false;
    return original.fullName !== user.fullName.trim() || original.role !== user.role;
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
        <h1 className="text-3xl font-black text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">Manage user names and access roles.</p>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200">
          {loading ? (
            <div className="p-5 text-slate-600">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-5 text-slate-600">No users found.</div>
          ) : (
            <table className="w-full min-w-[860px] bg-white">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-t border-slate-100 text-sm">
                    <td className="px-4 py-3">
                      <input
                        value={user.fullName}
                        onChange={event => updateRow(user.id, { fullName: event.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{user.phone}</td>
                    <td className="px-4 py-3 text-slate-700">{user.email || '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={event => updateRow(user.id, { role: event.target.value as UserRow['role'] })}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void saveUser(user)}
                        disabled={saving[user.id] || !hasUserChanges(user) || !user.fullName.trim()}
                        className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                      >
                        {saving[user.id] ? 'Saving...' : 'Save'}
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
