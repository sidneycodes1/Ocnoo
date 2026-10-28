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

// Mirrors CartContext exactly: hydrate once from localStorage, persist after
// hydration, drop ids that no longer exist in the catalogue.
const STORAGE_KEY = "ocnoo-saved";

interface SavedContextValue {
  ids: string[];
  products: Product[];
  count: number;
  hydrated: boolean;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: ReactNode }) {
  const { getProduct } = useCatalog();
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) {
          setIds(parsed.filter((id) => typeof id === "string" && getProduct(id)));
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, [getProduct]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* storage may be unavailable; list still works in-memory */
    }
  }, [ids, hydrated]);

  const toggle = useCallback(
    (id: string) => {
      if (!getProduct(id)) return;
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [getProduct]
  );

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const isSaved = useCallback(
    (id: string) => ids.includes(id),
    [ids]
  );

  const products = useMemo(
    () => ids.map((id) => getProduct(id)).filter((p): p is Product => !!p),
    [ids, getProduct]
  );

  const value: SavedContextValue = {
    ids,
    products,
    count: ids.length,
    hydrated,
    isSaved,
    toggle,
    remove,
    clear,
  };

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext);
  if (!ctx) {
    throw new Error("useSaved must be used within a SavedProvider");
  }
  return ctx;
}
