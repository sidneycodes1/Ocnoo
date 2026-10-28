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

/**
 * Which sellers this device follows.
 *
 * Mirrors SavedContext exactly — hydrate once from localStorage, persist only
 * after hydration (so the first render cannot clobber a stored list), expose
 * `hydrated` so a control can avoid flickering its stored state.
 *
 * Keyed by seller NAME rather than id because there is no seller registry to
 * resolve against yet: OCNOO is a single-vendor store, so the only entry that
 * exists today is the store itself. When listings start carrying their own
 * `SellerInfo`, this becomes id-keyed in one place.
 */
const STORAGE_KEY = "ocnoo-following";

interface SellersContextValue {
  names: string[];
  count: number;
  hydrated: boolean;
  isFollowing: (name: string) => boolean;
  toggle: (name: string) => void;
}

const SellersContext = createContext<SellersContextValue | null>(null);

export function SellersProvider({ children }: { children: ReactNode }) {
  const [names, setNames] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          setNames(
            parsed.filter(
              (n): n is string => typeof n === "string" && n.trim().length > 0
            )
          );
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch {
      /* storage may be unavailable; the toggle still works in-memory */
    }
  }, [names, hydrated]);

  const toggle = useCallback((name: string) => {
    setNames((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  }, []);

  const isFollowing = useCallback(
    (name: string) => names.includes(name),
    [names]
  );

  const value = useMemo<SellersContextValue>(
    () => ({ names, count: names.length, hydrated, isFollowing, toggle }),
    [names, hydrated, isFollowing, toggle]
  );

  return <SellersContext.Provider value={value}>{children}</SellersContext.Provider>;
}

export function useFollowingSellers(): SellersContextValue {
  const ctx = useContext(SellersContext);
  if (!ctx) {
    throw new Error("useFollowingSellers must be used within a SellersProvider");
  }
  return ctx;
}
