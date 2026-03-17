'use client';

import { useEffect, useState } from 'react';

type Settings = {
  orderNotifications: boolean;
  allowCashOnDelivery: boolean;
  lowStockThreshold: number;
  supportEmail: string;
};

type Toast = {
  type: 'success' | 'error';
  message: string;
};

const DEFAULT_SETTINGS: Settings = {
  orderNotifications: true,
  allowCashOnDelivery: true,
  lowStockThreshold: 5,
  supportEmail: 'support@wigfactory.com',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/settings', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load settings');
        const payload = (await response.json()) as Settings;
        setSettings(payload);
        setSavedSettings(payload);
      } catch (err) {
        setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const saveSettings = async () => {
    try {
      setSaving(true);

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || 'Failed to save settings');
      }

      const updated = (await response.json()) as Settings;
      setSettings(updated);
      setSavedSettings(updated);
      setToast({ type: 'success', message: 'Settings saved successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const hasChanges =
    settings.orderNotifications !== savedSettings.orderNotifications ||
    settings.allowCashOnDelivery !== savedSettings.allowCashOnDelivery ||
    settings.lowStockThreshold !== savedSettings.lowStockThreshold ||
    settings.supportEmail.trim() !== savedSettings.supportEmail.trim();

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
        <h1 className="text-3xl font-black text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Configure operational defaults for the admin workspace.</p>

        {loading ? (
          <div className="mt-6 text-slate-600">Loading settings...</div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">Order Notifications</p>
              <p className="mt-1 text-sm text-slate-600">Enable alerts for new orders and cancellations.</p>
              <input
                type="checkbox"
                checked={settings.orderNotifications}
                onChange={event => setSettings(prev => ({ ...prev, orderNotifications: event.target.checked }))}
                className="mt-3"
              />
            </label>

            <label className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">Cash On Delivery</p>
              <p className="mt-1 text-sm text-slate-600">Allow customers to pay by cash at delivery.</p>
              <input
                type="checkbox"
                checked={settings.allowCashOnDelivery}
                onChange={event => setSettings(prev => ({ ...prev, allowCashOnDelivery: event.target.checked }))}
                className="mt-3"
              />
            </label>

            <label className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">Low Stock Threshold</p>
              <p className="mt-1 text-sm text-slate-600">Trigger low stock warnings at this value.</p>
              <input
                type="number"
                min={0}
                value={settings.lowStockThreshold}
                onChange={event =>
                  setSettings(prev => ({
                    ...prev,
                    lowStockThreshold: Number(event.target.value) || 0,
                  }))
                }
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>

            <label className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">Support Email</p>
              <p className="mt-1 text-sm text-slate-600">Shown to staff for system support contact.</p>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={event => setSettings(prev => ({ ...prev, supportEmail: event.target.value }))}
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}

        <button
          type="button"
          onClick={() => void saveSettings()}
          disabled={loading || saving || !hasChanges}
          className="mt-6 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </section>
  );
}
