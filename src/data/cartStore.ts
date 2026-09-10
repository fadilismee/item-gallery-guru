import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./products";

export type CartItem = {
  product: Product;
  qty: number;
};

type CartStore = {
  items: CartItem[];
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, qty = 1) =>
        set((s) => {
          const idx = s.items.findIndex((i) => i.product.id === product.id);
          if (idx >= 0) {
            const next = [...s.items];
            const current = next[idx];
            if (!current) return s;
            next[idx] = { ...current, qty: current.qty + qty };
            return { items: next };
          }
          return { items: [...s.items, { product, qty }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.product.id !== id) })),
      updateQty: (id, qty) =>
        set((s) => {
          if (qty <= 0) return { items: s.items.filter((i) => i.product.id !== id) };
          return {
            items: s.items.map((i) => (i.product.id === id ? { ...i, qty } : i)),
          };
        }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, b) => a + b.qty, 0),
      subtotal: () => get().items.reduce((a, b) => a + b.product.price * b.qty, 0),
    }),
    { name: "buana-cart" },
  ),
);
