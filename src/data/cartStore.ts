import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, ProductVariant } from "./products";

export type CartItem = {
  product: Product;
  selectedVariant?: ProductVariant;
  qty: number;
};

const itemKey = (productId: string, variantName?: string) =>
  variantName ? `${productId}::${variantName}` : productId;

type CartStore = {
  items: CartItem[];
  add: (product: Product, qty?: number, variant?: ProductVariant) => void;
  remove: (productId: string, variantName?: string) => void;
  updateQty: (productId: string, qty: number, variantName?: string) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product, qty = 1, variant) =>
        set((s) => {
          const key = itemKey(product.id, variant?.name);
          const idx = s.items.findIndex(
            (i) => itemKey(i.product.id, i.selectedVariant?.name) === key,
          );
          if (idx >= 0) {
            const next = [...s.items];
            const current = next[idx];
            if (!current) return s;
            next[idx] = { ...current, qty: current.qty + qty };
            return { items: next };
          }
          return { items: [...s.items, { product, selectedVariant: variant, qty }] };
        }),
      remove: (productId, variantName) =>
        set((s) => {
          const key = itemKey(productId, variantName);
          return {
            items: s.items.filter((i) => itemKey(i.product.id, i.selectedVariant?.name) !== key),
          };
        }),
      updateQty: (productId, qty, variantName) =>
        set((s) => {
          const key = itemKey(productId, variantName);
          if (qty <= 0) {
            return {
              items: s.items.filter((i) => itemKey(i.product.id, i.selectedVariant?.name) !== key),
            };
          }
          return {
            items: s.items.map((i) =>
              itemKey(i.product.id, i.selectedVariant?.name) === key ? { ...i, qty } : i,
            ),
          };
        }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((a, b) => a + b.qty, 0),
      subtotal: () =>
        get().items.reduce((a, b) => a + (b.selectedVariant?.price ?? b.product.price) * b.qty, 0),
    }),
    { name: "buana-cart" },
  ),
);
