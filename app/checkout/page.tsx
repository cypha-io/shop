'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/hooks/useCart';

type CheckoutForm = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: 'cash' | 'mobile-money' | 'card';
};

const INITIAL_FORM: CheckoutForm = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  city: 'Accra',
  notes: '',
  paymentMethod: 'mobile-money',
};

const normalizePhoneInput = (value: string) => value.replace(/\D/g, '').slice(0, 10);
const isValidPhone = (value: string) => /^0\d{9}$/.test(value);

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');

  const parsePrice = (value: string) => {
    const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0),
    [items]
  );
  const delivery = items.length > 0 ? 10 : 0;
  const total = subtotal + delivery;

  const onChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canPlaceOrder =
    items.length > 0 &&
    form.fullName.trim() &&
    isValidPhone(form.phone.trim()) &&
    form.address.trim() &&
    form.city.trim();

  const placeOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canPlaceOrder || submitting) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: normalizePhoneInput(form.phone),
          email: form.email,
          address: form.address,
          city: form.city,
          notes: form.notes,
          paymentMethod: form.paymentMethod,
          subtotal,
          delivery,
          total,
          items,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; details?: string };
        throw new Error(payload.details || payload.error || 'Failed to place order');
      }

      const payload = (await response.json()) as { orderNumber?: string };
      setPlacedOrderNumber(payload.orderNumber || null);
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-8 text-center">Checkout</h1>

        {orderPlaced ? (
          <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <h2 className="text-2xl font-black text-gray-900 mb-3">Order placed successfully</h2>
            <p className="text-gray-600 mb-6">Thank you. We received your order and will contact you shortly.</p>
            {placedOrderNumber && (
              <p className="text-sm font-bold text-orange-500 mb-6">Order Number: {placedOrderNumber}</p>
            )}
            <Link href="/products" className="inline-block bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600">
              Continue Shopping
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500 mb-6">Your cart is empty</p>
            <Link href="/products" className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full font-bold hover:bg-orange-600">
              Browse Products
            </Link>
          </div>
        ) : (
          <form onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-2">Delivery Details</h2>

              <input
                type="text"
                value={form.fullName}
                onChange={(e) => onChange('fullName', e.target.value)}
                placeholder="Full name"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                required
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => onChange('phone', normalizePhoneInput(e.target.value))}
                  inputMode="numeric"
                  pattern="0[0-9]{9}"
                  maxLength={10}
                  placeholder="0XXXXXXXXX"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                  required
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => onChange('email', e.target.value)}
                  placeholder="Email (optional)"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                />
              </div>

              <input
                type="text"
                value={form.address}
                onChange={(e) => onChange('address', e.target.value)}
                placeholder="Street address"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                required
              />

              <input
                type="text"
                value={form.city}
                onChange={(e) => onChange('city', e.target.value)}
                placeholder="City"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                required
              />

              <textarea
                value={form.notes}
                onChange={(e) => onChange('notes', e.target.value)}
                placeholder="Delivery notes (optional)"
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
              />

              <div>
                <p className="font-bold text-gray-800 mb-2">Payment Method</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'mobile-money', label: 'Mobile Money' },
                    { value: 'cash', label: 'Cash on Delivery' },
                    { value: 'card', label: 'Card' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange('paymentMethod', option.value)}
                      className={`px-4 py-2 rounded-full border text-sm font-semibold ${
                        form.paymentMethod === option.value
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'bg-white text-gray-700 border-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm border border-gray-200 h-fit lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-black text-gray-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-800 text-sm">GH₵{(parsePrice(item.price) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">GH₵{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-bold">GH₵{delivery.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-black text-lg">Total</span>
                  <span className="font-black text-xl text-orange-500">GH₵{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!canPlaceOrder || submitting}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white py-3.5 rounded-xl font-black text-base hover:from-orange-400 hover:to-orange-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Placing order...' : 'Place Order'}
              </button>
              {submitError && <p className="mt-3 text-sm font-semibold text-orange-500">{submitError}</p>}
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
