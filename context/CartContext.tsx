"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types";
import { useCatalog } from "@/context/CatalogProvider";
import { trackEvent } from "@/lib/events";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotal: number;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "ocnoo-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { getProduct } = useCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once from localStorage on the client (no-op on the server).
  // Ids that are no longer published are dropped here rather than rendered as
  // an empty row — the catalogue is the authority on what still exists.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed.filter((i) => getProduct(i.productId)));
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, [getProduct]);

  // Persist whenever items change (after hydration to avoid clobbering).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable; cart still works in-memory */
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (productId: string, quantity = 1) => {
      if (!getProduct(productId)) return;
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === productId);
        if (existing) {
          return prev.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, i.quantity + quantity) }
              : i
          );
        }
        return [...prev, { productId, quantity: Math.max(1, quantity) }];
      });
      // Every add path - card quick-add, buy box, sticky card - comes through
      // here, so the counter cannot miss one and does not need five call sites.
      trackEvent("add_to_cart", { productId });
    },
    [getProduct]
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const lines = useMemo<CartLine[]>(() => {
    return items
      .map((i) => {
        const product = getProduct(i.productId);
        if (!product) return null;
        return {
          product,
          quantity: i.quantity,
          lineTotal: product.price * i.quantity,
        };
      })
      .filter((l): l is CartLine => l !== null);
  }, [items, getProduct]);

  const count = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines]);
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.lineTotal, 0),
    [lines]
  );

  const value: CartContextValue = {
    items,
    lines,
    count,
    subtotal,
    hydrated,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
