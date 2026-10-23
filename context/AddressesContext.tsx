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
import { NG_STATES } from "@/lib/delivery";
import {
  getLga,
  getLgaInState,
  getStateByName,
  resolveStateName,
  slug,
} from "@/data/nigeria/locations";

/**
 * Resolve a state label to this app's canonical name. Saved addresses predate
 * the location dataset and called the FCT "FCT - Abuja", so the alias is
 * followed rather than the row being dropped.
 */
function canonicalState(name: string): string {
  const resolved = resolveStateName(name);
  return NG_STATES.includes(resolved) ? resolved : "";
}

/**
 * Turn a stored `lga` field into a real `state/lga` id, or "" when it does not
 * resolve. An address with no usable LGA is still deliverable, so a bad value is
 * discarded rather than destroying the record.
 */
function canonicalLga(stateId: string, value: string): string {
  if (!stateId || !value) return "";
  const candidate = value.includes("/") ? value : `${stateId}/${slug(value)}`;
  return getLgaInState(stateId, candidate) ? candidate : "";
}

/**
 * A saved delivery destination. The field list is exactly what checkout needs
 * to place an order (name, phone, street, state) plus the two things a rider
 * actually asks for on the phone - the city and a landmark - and nothing else.
 * There is no PIN, no "preferred courier", no country field: the store delivers
 * within Nigeria only, so those would be inputs that do nothing.
 */
export interface Address {
  id: string;
  /** Short tag shown in the list: "Home", "Office", or the visitor's own word. */
  label: string;
  recipientName: string;
  phone: string;
  /** Street address, e.g. "12 Adeola Odeku Street". */
  address: string;
  city: string;
  /** One of NG_STATES, canonical spelling. Enforced on write. */
  state: string;
  /**
   * `state-slug/lga-slug` from `data/nigeria/locations.ts`, e.g. `lagos/ikeja`.
   * Empty for an address saved before the LGA field existed — the street, town
   * and state are still enough to deliver to, so those rows stay valid.
   */
  lga: string;
  /** Optional. "Gate 4, opposite the filling station." */
  landmark: string;
  /** The one checkout prefill uses. At most one address has it. */
  isDefault: boolean;
  createdAt: string;
}

export type AddressDraft = Omit<Address, "id" | "createdAt" | "isDefault">;

export const emptyAddressDraft: AddressDraft = {
  label: "Home",
  recipientName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  lga: "",
  landmark: "",
};

/** The suggested tags, as a real marketplace shows them. Free text is allowed. */
export const ADDRESS_LABELS = ["Home", "Office", "Other"] as const;

interface AddressesContextValue {
  addresses: Address[];
  hydrated: boolean;
  /** The default address, or the newest one, or null. What checkout prefill uses. */
  defaultAddress: Address | null;
  getById: (id: string) => Address | undefined;
  /** Returns null if the state is not a Nigerian state. */
  addAddress: (draft: AddressDraft) => Address | null;
  updateAddress: (id: string, draft: AddressDraft) => Address | null;
  removeAddress: (id: string) => void;
  setDefault: (id: string) => void;
}

// Third localStorage store on this origin, after the cart, saved list, orders
// and profile. Addresses are text only, so the payload stays small.
const STORAGE_KEY = "ocnoo-addresses";
const AddressesContext = createContext<AddressesContextValue | null>(null);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Storage is untrusted: it can hold an older shape, or hand-edited JSON. Drop
 * anything whose state is not a real state, since the delivery fee is quoted
 * from that field and a made-up state would silently price the order wrong.
 */
function sanitize(raw: unknown): Address | null {
  if (!isRecord(raw)) return null;
  // Resolved rather than matched exactly: rows written before the location
  // dataset called the FCT "FCT - Abuja" and must not vanish over a label.
  const state = canonicalState(str(raw.state));
  if (!state) return null;
  const address = str(raw.address).trim();
  if (!address) return null;
  return {
    id: str(raw.id) || `adr-${Math.random().toString(36).slice(2, 10)}`,
    label: str(raw.label).trim() || "Home",
    recipientName: str(raw.recipientName).trim(),
    phone: str(raw.phone).trim(),
    address,
    city: str(raw.city).trim(),
    state,
    lga: canonicalLga(getStateByName(state)?.id ?? "", str(raw.lga).trim()),
    landmark: str(raw.landmark).trim(),
    isDefault: raw.isDefault === true,
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
}

function read(): Address[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitize).filter((a): a is Address => a !== null);
  } catch {
    return [];
  }
}

function newId(existing: Address[]): string {
  let id = "";
  do {
    id = `adr-${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
  } while (existing.some((a) => a.id === id));
  return id;
}

export function AddressesProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = read();
    // If nothing marked itself default, promote the newest so the list never
    // has zero defaults while it has entries.
    if (stored.length > 0 && !stored.some((a) => a.isDefault)) {
      stored[0] = { ...stored[0], isDefault: true };
    }
    setAddresses(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses.slice(0, 20)));
    } catch {
      /* storage may be unavailable; the list still works in-memory */
    }
  }, [addresses, hydrated]);

  const getById = useCallback(
    (id: string) => addresses.find((a) => a.id === id),
    [addresses]
  );

  const addAddress = useCallback(
    (draft: AddressDraft): Address | null => {
      // Resolved on write as well as on read, so what the caller gets back is
      // what is actually stored.
      const state = canonicalState(draft.state);
      if (!state) return null;
      const entry: Address = {
        ...draft,
        state,
        lga: canonicalLga(getStateByName(state)?.id ?? "", draft.lga),
        id: newId(addresses),
        isDefault: addresses.length === 0,
        createdAt: new Date().toISOString(),
      };
      setAddresses((prev) => [entry, ...prev]);
      return entry;
    },
    [addresses]
  );

  const updateAddress = useCallback(
    (id: string, draft: AddressDraft): Address | null => {
      const state = canonicalState(draft.state);
      if (!state) return null;
      const target = addresses.find((a) => a.id === id);
      if (!target) return null;
      // Built from the current list rather than inside the updater: the caller
      // needs the saved record back, and a setState updater has not necessarily
      // run by the time this function returns.
      const updated: Address = {
        ...target,
        ...draft,
        state,
        lga: canonicalLga(getStateByName(state)?.id ?? "", draft.lga),
      };
      setAddresses((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    [addresses]
  );

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const next = prev.filter((a) => a.id !== id);
      // Deleting the default must not leave checkout with no default.
      if (prev.find((a) => a.id === id)?.isDefault && next.length > 0) {
        return next.map((a, i) => ({ ...a, isDefault: i === 0 }));
      }
      return next;
    });
  }, []);

  const setDefault = useCallback((id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }, []);

  const defaultAddress = useMemo(() => {
    if (addresses.length === 0) return null;
    return addresses.find((a) => a.isDefault) ?? addresses[0];
  }, [addresses]);

  const value = useMemo<AddressesContextValue>(
    () => ({
      addresses,
      hydrated,
      defaultAddress,
      getById,
      addAddress,
      updateAddress,
      removeAddress,
      setDefault,
    }),
    [
      addresses,
      hydrated,
      defaultAddress,
      getById,
      addAddress,
      updateAddress,
      removeAddress,
      setDefault,
    ]
  );

  return (
    <AddressesContext.Provider value={value}>{children}</AddressesContext.Provider>
  );
}

export function useAddresses(): AddressesContextValue {
  const ctx = useContext(AddressesContext);
  if (!ctx) {
    throw new Error("useAddresses must be used within an AddressesProvider");
  }
  return ctx;
}

/** How an address is written on one line, e.g. on the receipt or list row. */
export function formatAddress(a: Address): string {
  // Street, town, then the LGA it sits in — the order a rider reads an
  // address in, and the LGA is omitted for rows saved before it existed.
  const lgaName = a.lga ? getLga(a.lga)?.name ?? "" : "";
  const street = [a.address, a.city, lgaName].filter(Boolean).join(", ");
  return [street, a.state].filter(Boolean).join(" · ");
}
