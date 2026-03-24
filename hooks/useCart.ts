'use client';

import { useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY_PREFIX = 'wig-factory-cart';
const USER_PHONE_KEY = 'wf-user-phone';
const CART_EVENT = 'cart-updated';

export type CartItem = {
  id: number;
  name: string;
  price: string;
  image: string;
  category?: string;
  quantity: number;
};

type CartProductInput = Omit<CartItem, 'quantity'>;

function isBrowser() {
  return typeof window !== 'undefined';
}

function getCartStorageKey() {
  if (!isBrowser()) return `${CART_STORAGE_KEY_PREFIX}:guest`;
  const phone = window.localStorage.getItem(USER_PHONE_KEY)?.trim();
  return phone ? `${CART_STORAGE_KEY_PREFIX}:${phone}` : `${CART_STORAGE_KEY_PREFIX}:guest`;
}

function readCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(getCartStorageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => typeof item?.id === 'number' && typeof item?.quantity === 'number');
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(getCartStorageKey(), JSON.stringify(items));
  window.dispatchEvent(new Event(CART_EVENT));
}

export function addToCart(product: CartProductInput, quantity = 1) {
  const items = readCart();
  const existing = items.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += Math.max(1, quantity);
  } else {
    items.push({ ...product, quantity: Math.max(1, quantity) });
  }

  writeCart(items);
}

export function updateCartItemQuantity(id: number, quantity: number) {
  const items = readCart().map(item =>
    item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  writeCart(items);
}

export function removeCartItem(id: number) {
  const items = readCart().filter(item => item.id !== id);
  writeCart(items);
}

export function clearCart() {
  writeCart([]);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    const syncOnVisible = () => {
      if (document.visibilityState === 'visible') {
        sync();
      }
    };
    sync();

    window.addEventListener(CART_EVENT, sync);
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', syncOnVisible);

    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', syncOnVisible);
    };
  }, []);

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  return {
    items,
    totalItems,
    addToCart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  };
}
