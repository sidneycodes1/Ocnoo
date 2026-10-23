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
import {
  SOCIAL_PROVIDERS,
  getProvider,
  normaliseHandle,
  type NormaliseResult,
} from "@/data/providers";

/**
 * The social accounts this browser's seller has declared.
 *
 * There is no server, so nothing here is verified against the platform. What is
 * guaranteed is narrower and worth stating exactly: the stored `url` is always
 * rebuilt from a handle that passed `normaliseHandle`, so a saved link can only
 * ever point at that platform's real profile URL for that name.
 */
export interface Connection {
  /** A key from SOCIAL_PROVIDERS. Unknown keys are dropped on read. */
  provider: string;
  handle: string;
  /** Canonical URL derived from the handle, never the seller's raw input. */
  url: string;
  addedAt: string;
}

export type ConnectResult =
  | { ok: true; connection: Connection }
  | { ok: false; error: string };

interface ConnectionsContextValue {
  /** In the order of SOCIAL_PROVIDERS, so the list does not reorder as you add. */
  connections: Connection[];
  hydrated: boolean;
  count: number;
  get: (providerKey: string) => Connection | undefined;
  /** Takes what the seller typed; validates, normalises, replaces any existing row. */
  connect: (providerKey: string, input: string) => ConnectResult;
  disconnect: (providerKey: string) => void;
}

const STORAGE_KEY = "ocnoo-connections";
const ConnectionsContext = createContext<ConnectionsContextValue | null>(null);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Storage is untrusted — it can hold an older shape or hand-edited JSON. Rebuild
 * each row from its handle and drop it if the handle no longer validates, so a
 * doctored `url` in localStorage can never reach an href.
 */
function sanitize(raw: unknown): Connection | null {
  if (!isRecord(raw)) return null;
  const provider = getProvider(typeof raw.provider === "string" ? raw.provider : "");
  if (!provider) return null;
  const handle = typeof raw.handle === "string" ? raw.handle : "";
  const result = normaliseHandle(provider, handle);
  if (!result.ok) return null;
  return {
    provider: provider.key,
    handle: result.handle,
    url: result.url,
    addedAt: typeof raw.addedAt === "string" ? raw.addedAt : new Date().toISOString(),
  };
}

function read(): Connection[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const rows = Array.isArray(parsed)
      ? parsed
      : isRecord(parsed)
        ? Object.entries(parsed).map(([provider, value]) => ({
            ...(isRecord(value) ? value : {}),
            provider,
          }))
        : [];
    const clean = rows.map(sanitize).filter((c): c is Connection => c !== null);
    // One row per provider, whichever came first.
    const seen = new Set<string>();
    return clean.filter((c) => !seen.has(c.provider) && seen.add(c.provider));
  } catch {
    return [];
  }
}

export function ConnectionsProvider({ children }: { children: ReactNode }) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setConnections(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
    } catch {
      /* storage may be unavailable; the list still works in memory */
    }
  }, [connections, hydrated]);

  const get = useCallback(
    (providerKey: string) => connections.find((c) => c.provider === providerKey),
    [connections],
  );

  const connect = useCallback(
    (providerKey: string, input: string): ConnectResult => {
      const provider = getProvider(providerKey);
      if (!provider) return { ok: false, error: "Unknown platform." };
      const result: NormaliseResult = normaliseHandle(provider, input);
      if (!result.ok) return result;
      const existing = connections.find((c) => c.provider === providerKey);
      const entry: Connection = {
        provider: providerKey,
        handle: result.handle,
        url: result.url,
        // Re-adding the same account should not look like a new declaration.
        addedAt:
          existing && existing.handle === result.handle
            ? existing.addedAt
            : new Date().toISOString(),
      };
      setConnections((prev) => {
        const rest = prev.filter((c) => c.provider !== providerKey);
        // Keep the registry order rather than insertion order.
        return SOCIAL_PROVIDERS.map((p) =>
          p.key === providerKey ? entry : rest.find((c) => c.provider === p.key),
        ).filter((c): c is Connection => Boolean(c));
      });
      return { ok: true, connection: entry };
    },
    [connections],
  );

  const disconnect = useCallback((providerKey: string) => {
    setConnections((prev) => prev.filter((c) => c.provider !== providerKey));
  }, []);

  const value = useMemo<ConnectionsContextValue>(
    () => ({
      connections,
      hydrated,
      count: connections.length,
      get,
      connect,
      disconnect,
    }),
    [connections, hydrated, get, connect, disconnect],
  );

  return (
    <ConnectionsContext.Provider value={value}>
      {children}
    </ConnectionsContext.Provider>
  );
}

export function useConnections(): ConnectionsContextValue {
  const ctx = useContext(ConnectionsContext);
  if (!ctx) {
    throw new Error("useConnections must be used within a ConnectionsProvider");
  }
  return ctx;
}
