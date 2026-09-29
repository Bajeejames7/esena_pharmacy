import { useCallback, useEffect, useState } from 'react';

/**
 * What the shopper's phone remembers: the cart, their contact details (so the
 * checkout is filled in next time), and the tracking tokens of their orders
 * and appointments — there are no customer accounts on the backend, so the
 * token is the only handle a customer has on an order.
 *
 * localStorage, which Capacitor's WebView keeps across app restarts.
 */

const KEYS = { cart: 'esena.cart', me: 'esena.customer', orders: 'esena.orders', appts: 'esena.appointments' };

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked: the in-memory state still works for this session.
  }
}

const listeners = new Set();
let cart = read(KEYS.cart, []);

function setCart(next) {
  cart = next;
  write(KEYS.cart, cart);
  listeners.forEach((fn) => fn(cart));
}

/** The cart, shared by every screen that uses this hook. */
export function useCart() {
  const [items, setItems] = useState(cart);
  useEffect(() => {
    listeners.add(setItems);
    return () => listeners.delete(setItems);
  }, []);

  const add = useCallback((product, quantity = 1) => {
    const existing = cart.find((i) => i.id === product.id);
    const max = Number(product.stock) || 99;
    if (existing) {
      setCart(cart.map((i) => (i.id === product.id ? { ...i, quantity: Math.min(max, i.quantity + quantity) } : i)));
    } else {
      setCart([...cart, { id: product.id, name: product.name, price: Number(product.price), image: product.image, stock: max, quantity: Math.min(max, quantity) }]);
    }
  }, []);
  const setQuantity = useCallback((id, quantity) => {
    setCart(quantity <= 0 ? cart.filter((i) => i.id !== id) : cart.map((i) => (i.id === id ? { ...i, quantity: Math.min(i.stock || 99, quantity) } : i)));
  }, []);
  const clear = useCallback(() => setCart([]), []);

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  return { items, add, setQuantity, clear, count, subtotal };
}

export const customer = {
  get: () => read(KEYS.me, { name: '', email: '', phone: '', address: '', city: 'Nairobi', landmark: '' }),
  save: (details) => write(KEYS.me, details),
};

/** Orders and appointments this phone has placed, newest first. */
export const history = {
  orders: () => read(KEYS.orders, []),
  addOrder: (entry) => write(KEYS.orders, [entry, ...read(KEYS.orders, []).filter((o) => o.token !== entry.token)].slice(0, 30)),
  appointments: () => read(KEYS.appts, []),
  addAppointment: (entry) => write(KEYS.appts, [entry, ...read(KEYS.appts, []).filter((a) => a.token !== entry.token)].slice(0, 30)),
};
