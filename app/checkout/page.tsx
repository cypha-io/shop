'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
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

type AppliedPromo = {
  code: string;
  discountAmount: number;
  totalAfterDiscount: number;
};

type ActivePromo = {
  id: number;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
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
const USER_PHONE_KEY = 'wf-user-phone';
const CHECKOUT_PHONE_KEY = 'wf-checkout-phone';

type PaystackInlineOptions = {
  key: string;
  email: string;
  amount: number;
  currency: 'GHS';
  ref?: string;
  channels?: string[];
  access_code?: string;
  metadata?: Record<string, unknown>;
  callback: (response: { reference?: string }) => void;
  onClose: () => void;
};

type PaystackInlineHandle = {
  openIframe: () => void;
};

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackInlineOptions) => PaystackInlineHandle;
    };
  }
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null);
  const [activePromos, setActivePromos] = useState<ActivePromo[]>([]);

  const parsePrice = (value: string) => {
    const numeric = Number(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0),
    [items]
  );
  const delivery = items.length > 0 ? 10 : 0;
  const totalBeforeDiscount = subtotal + delivery;
  const discountAmount = appliedPromo?.discountAmount || 0;
  const total = Math.max(0, totalBeforeDiscount - discountAmount);

  const onChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const applyPromo = async () => {
    if (!promoCode.trim() || applyingPromo) return;

    try {
      setApplyingPromo(true);
      setPromoMessage('');

      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.trim(),
          subtotal,
          delivery,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        code?: string;
        discountAmount?: number;
        totalAfterDiscount?: number;
        error?: string;
      };

      if (!response.ok || !payload.code) {
        throw new Error(payload.error || 'Invalid promo code');
      }

      setAppliedPromo({
        code: payload.code,
        discountAmount: Number(payload.discountAmount || 0),
        totalAfterDiscount: Number(payload.totalAfterDiscount || 0),
      });
      setPromoCode(payload.code);
      setPromoMessage(`Promo applied: ${payload.code}`);
    } catch (error) {
      setAppliedPromo(null);
      setPromoMessage(error instanceof Error ? error.message : 'Failed to apply promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoMessage('Promo removed');
  };

  useEffect(() => {
    if (!appliedPromo) return;
    setAppliedPromo(null);
    setPromoMessage('Cart changed. Re-apply promo code.');
  }, [appliedPromo, subtotal, delivery]);

  useEffect(() => {
    const loadActivePromos = async () => {
      try {
        const response = await fetch('/api/promotions/active', { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as ActivePromo[];
        setActivePromos(Array.isArray(data) ? data : []);
      } catch {
        setActivePromos([]);
      }
    };

    void loadActivePromos();
  }, []);

  const canPlaceOrder =
    items.length > 0 &&
    form.fullName.trim() &&
    isValidPhone(form.phone.trim()) &&
    form.address.trim() &&
    form.city.trim() &&
    (form.paymentMethod === 'cash' || form.email.trim().includes('@'));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const orderNumber = params.get('orderNumber');

    if (payment === 'success') {
      setPlacedOrderNumber(orderNumber || null);
      setOrderPlaced(true);
      setSubmitError('');
      clearCart();

      const checkoutPhone = window.sessionStorage.getItem(CHECKOUT_PHONE_KEY)?.trim();
      if (checkoutPhone && isValidPhone(checkoutPhone)) {
        window.localStorage.setItem(USER_PHONE_KEY, checkoutPhone);
      }
      window.sessionStorage.removeItem(CHECKOUT_PHONE_KEY);
      return;
    }

    if (payment === 'failed') {
      setSubmitError('Payment was not completed. You can try again.');
    }
  }, [clearCart]);

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
          promoCode: appliedPromo?.code || null,
          items,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string; details?: string };
        throw new Error(payload.details || payload.error || 'Failed to place order');
      }

      const payload = (await response.json()) as { id?: number; orderNumber?: string };

      if (form.paymentMethod === 'cash') {
        setPlacedOrderNumber(payload.orderNumber || null);
        clearCart();
        const normalizedPhone = normalizePhoneInput(form.phone);
        if (isValidPhone(normalizedPhone)) {
          window.localStorage.setItem(USER_PHONE_KEY, normalizedPhone);
        }
        setOrderPlaced(true);
        return;
      }

      const normalizedPhone = normalizePhoneInput(form.phone);
      if (isValidPhone(normalizedPhone)) {
        window.sessionStorage.setItem(CHECKOUT_PHONE_KEY, normalizedPhone);
      }

      const paymentInitResponse = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: payload.id,
          orderNumber: payload.orderNumber,
          total,
          email: form.email,
          fullName: form.fullName,
          phone: normalizePhoneInput(form.phone),
          paymentMethod: form.paymentMethod,
        }),
      });

      const paymentPayload = (await paymentInitResponse.json().catch(() => ({}))) as {
        authorizationUrl?: string;
        accessCode?: string;
        publicKey?: string;
        error?: string;
        details?: string;
        reference?: string;
        amount?: number;
        email?: string;
        orderId?: number;
        orderNumber?: string;
        channels?: string[];
        mock?: boolean;
        mockVerifyUrl?: string;
      };

      if (!paymentInitResponse.ok) {
        throw new Error(paymentPayload.details || paymentPayload.error || 'Failed to initialize payment');
      }

      if (paymentPayload.mock && paymentPayload.mockVerifyUrl) {
        const mockVerifyResponse = await fetch(paymentPayload.mockVerifyUrl, {
          method: 'GET',
          cache: 'no-store',
        });
        const mockVerifyPayload = (await mockVerifyResponse.json().catch(() => ({}))) as {
          status?: 'success' | 'failed';
          orderNumber?: string;
        };

        if (!mockVerifyResponse.ok || mockVerifyPayload.status !== 'success') {
          throw new Error('Payment was not completed. Please try again.');
        }

        setPlacedOrderNumber(mockVerifyPayload.orderNumber || payload.orderNumber || null);
        clearCart();
        if (isValidPhone(normalizedPhone)) {
          window.localStorage.setItem(USER_PHONE_KEY, normalizedPhone);
        }
        window.sessionStorage.removeItem(CHECKOUT_PHONE_KEY);
        setOrderPlaced(true);
        return;
      }

      if (!window.PaystackPop || typeof window.PaystackPop.setup !== 'function') {
        throw new Error('Paystack checkout is not available right now. Please refresh and try again.');
      }

      const publicKey = paymentPayload.publicKey || '';
      if (!publicKey) {
        throw new Error('Paystack public key is missing. Please contact support.');
      }

      const paystackEmail = paymentPayload.email || form.email;
      const paystackAmount = Number(paymentPayload.amount) || Math.round(total * 100);
      const paystackOrderId = Number(paymentPayload.orderId) || Number(payload.id);

      await new Promise<void>((resolve, reject) => {
        let finished = false;

        const settle = (error?: Error) => {
          if (finished) return;
          finished = true;
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        };

        const verifyAndFinalizePayment = async (reference: string) => {
          const verifyUrl = `/api/payments/paystack/verify?api=1&orderId=${encodeURIComponent(String(paystackOrderId))}&reference=${encodeURIComponent(reference)}`;
          const verifyResponse = await fetch(verifyUrl, {
            method: 'GET',
            cache: 'no-store',
          });

          const verifyPayload = (await verifyResponse.json().catch(() => ({}))) as {
            status?: 'success' | 'failed';
            orderNumber?: string;
          };

          if (!verifyResponse.ok || verifyPayload.status !== 'success') {
            throw new Error('Payment verification failed. Please contact support if you were charged.');
          }

          setPlacedOrderNumber(verifyPayload.orderNumber || payload.orderNumber || null);
          clearCart();
          if (isValidPhone(normalizedPhone)) {
            window.localStorage.setItem(USER_PHONE_KEY, normalizedPhone);
          }
          window.sessionStorage.removeItem(CHECKOUT_PHONE_KEY);
          setOrderPlaced(true);
        };

        const handler = window.PaystackPop!.setup({
          key: publicKey,
          email: paystackEmail,
          amount: paystackAmount,
          currency: 'GHS',
          ref: paymentPayload.reference,
          access_code: paymentPayload.accessCode,
          channels: Array.isArray(paymentPayload.channels) ? paymentPayload.channels : undefined,
          metadata: {
            orderId: paystackOrderId,
            orderNumber: paymentPayload.orderNumber || payload.orderNumber,
          },
          callback: (responseRef) => {
            const reference = responseRef.reference || paymentPayload.reference || '';
            if (!reference) {
              settle(new Error('Payment reference was not received.'));
              return;
            }

            void verifyAndFinalizePayment(reference)
              .then(() => settle())
              .catch((error) => {
                settle(error instanceof Error ? error : new Error('Payment verification failed. Please try again.'));
              });
          },
          onClose: () => {
            settle(new Error('Payment was cancelled.'));
          },
        });

        handler.openIframe();
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-800">Checkout</h1>
          <p className="mt-2 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-orange-600">
            Checkout as Guest
          </p>
        </div>

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
                  placeholder={form.paymentMethod === 'cash' ? 'Email (optional)' : 'Email (required for online payment)'}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                  required={form.paymentMethod !== 'cash'}
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

              <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="font-bold text-gray-800 mb-2">Promo Code</p>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="min-w-0 flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-orange-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={applyingPromo || !promoCode.trim()}
                    className="px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black disabled:opacity-60"
                  >
                    {applyingPromo ? 'Applying...' : 'Apply'}
                  </button>
                  {appliedPromo ? (
                    <button
                      type="button"
                      onClick={removePromo}
                      className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                {promoMessage ? (
                  <p className={`mt-2 text-sm font-semibold ${appliedPromo ? 'text-green-600' : 'text-orange-500'}`}>
                    {promoMessage}
                  </p>
                ) : null}

                {activePromos.length > 0 ? (
                  <div className="mt-3 border-t border-gray-200 pt-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Available Promos</p>
                    <div className="space-y-1.5">
                      {activePromos.slice(0, 4).map((promo) => (
                        <button
                          key={promo.id}
                          type="button"
                          onClick={() => setPromoCode(promo.code)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left hover:border-orange-300"
                        >
                          <p className="text-sm font-bold text-gray-800">{promo.code}</p>
                          <p className="text-xs text-gray-600">
                            {promo.type === 'percentage' ? `${promo.value}% off` : `GH₵${promo.value.toFixed(2)} off`} • Min GH₵{promo.minOrder.toFixed(2)}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
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
                {discountAmount > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount {appliedPromo ? `(${appliedPromo.code})` : ''}</span>
                    <span className="font-bold text-green-600">-GH₵{discountAmount.toFixed(2)}</span>
                  </div>
                ) : null}
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
                {submitting
                  ? form.paymentMethod === 'cash'
                    ? 'Placing order...'
                    : 'Opening payment...'
                  : form.paymentMethod === 'cash'
                    ? 'Place Order'
                    : 'Pay Now'}
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
