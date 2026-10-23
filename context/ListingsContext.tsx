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
import { categories } from "@/data/categories";
import type { Condition } from "@/types";
import {
  NG_STATE_NAMES,
  getLga,
  getStateByName,
  resolveStateName,
} from "@/data/nigeria/locations";
import { MAX_PHOTOS } from "@/lib/images/encode";
import {
  deletePhotos,
  listPhotoAges,
  sweepAbandonedPhotos,
  sweepOrphanPhotos,
} from "@/lib/images/idb";

/**
 * Ads this browser's seller has composed.
 *
 * SPLIT STORAGE, AND WHY
 * The record below is text only and lives in localStorage beside the cart,
 * orders and addresses. Its photographs do not: they are binary blobs in
 * IndexedDB, addressed by the keys in `photoKeys`. Keeping the pixels out of
 * localStorage is not a optimisation, it is the only option — one phone photo as
 * a data URL can exceed the whole origin's 5 MB budget and would take the other
 * stores down with it.
 *
 * The cost of the split is that the two halves can drift, so this file owns both
 * directions: deleting a listing deletes its photos, and `sweepPhotos` removes
 * any photo no listing references — which is what an abandoned draft otherwise
 * leaves behind forever.
 */
export type ListingStatus = "draft" | "live";

export interface Listing {
  id: string;
  title: string;
  /** Whole Naira. `formatNaira` renders it like every other price on the site. */
  price: number;
  /** A `Category.slug`. Unknown slugs are dropped on read. */
  categorySlug: string;
  condition: Condition;
  description: string;
  /** Canonical Nigerian state name, the same spelling the address book stores. */
  state: string;
  /** `state-slug/lga-slug`, or "" when none was chosen. */
  lga: string;
  /** Free text: the area or town inside the LGA. There is no list to pick from. */
  town: string;
  /** IndexedDB keys, in display order. The first is the cover photo. */
  photoKeys: string[];
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
}

export type ListingDraft = Omit<
  Listing,
  "id" | "createdAt" | "updatedAt" | "status"
>;

export const emptyListingDraft: ListingDraft = {
  title: "",
  price: 0,
  categorySlug: categories[0]?.slug ?? "",
  condition: "New",
  description: "",
  state: "",
  lga: "",
  town: "",
  photoKeys: [],
};

export const LISTING_CONDITIONS: Condition[] = ["New", "Used", "Unopened"];

/** A ceiling on the text store, so a hand-edited file cannot grow unbounded. */
const MAX_LISTINGS = 50;

/**
 * How long an unreferenced photo must have been sitting alone before loading the
 * app reclaims it. An hour, not zero: the composer writes photos before a listing
 * exists, so a fresh orphan is normal and often belongs to a form still open in
 * another tab. Age is what separates "abandoned" from "in progress".
 */
const ABANDONED_AFTER_MS = 60 * 60 * 1000;

interface ListingsContextValue {
  listings: Listing[];
  hydrated: boolean;
  /** Published ads, newest first. What the /shop row shows. */
  liveListings: Listing[];
  /** Everything including drafts, newest first. What My ads shows. */
  myListings: Listing[];
  getById: (id: string) => Listing | undefined;
  /** Returns null when the draft is not deliverable — see `valid`. */
  addListing: (draft: ListingDraft, publish: boolean) => Listing | null;
  updateListing: (id: string, draft: ListingDraft) => Listing | null;
  setStatus: (id: string, status: ListingStatus) => void;
  /** Deletes the listing AND its photos. */
  removeListing: (id: string) => void;
  /** Why `addListing`/`updateListing` would refuse, for the form to report. */
  validate: (draft: ListingDraft) => Partial<Record<keyof ListingDraft, string>>;
  /** Drop stored photos that no listing references. Returns how many went. */
  sweepPhotos: () => Promise<number>;
  /** How many stored photos no listing references. Reads the store, not a cache. */
  unusedPhotoCount: () => Promise<number>;
}

const STORAGE_KEY = "ocnoo-listings";
const ListingsContext = createContext<ListingsContextValue | null>(null);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

const CATEGORY_SLUGS = new Set(categories.map((c) => c.slug));

function canonicalState(name: string): string {
  const resolved = resolveStateName(name);
  return NG_STATE_NAMES.includes(resolved) ? resolved : "";
}

/** Keys only, in order, capped, de-duplicated. A stray object cannot become a key. */
function keysOf(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value) {
    const key = str(raw).trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
    if (out.length >= MAX_PHOTOS) break;
  }
  return out;
}

/**
 * Storage is untrusted: it can hold an older shape or hand-edited JSON. A row is
 * kept only if it could actually be sold — a title, a real price, a real
 * category and a real state. An unknown photo key is NOT a reason to drop a
 * listing, because the blob may have been evicted while the ad is still true.
 */
function sanitize(raw: unknown): Listing | null {
  if (!isRecord(raw)) return null;
  const title = str(raw.title).trim();
  if (!title) return null;
  const price =
    typeof raw.price === "number" && Number.isFinite(raw.price) && raw.price > 0
      ? Math.round(raw.price)
      : 0;
  if (!price) return null;
  const categorySlug = str(raw.categorySlug);
  if (!CATEGORY_SLUGS.has(categorySlug)) return null;
  const state = canonicalState(str(raw.state));
  if (!state) return null;
  const condition = LISTING_CONDITIONS.includes(raw.condition as Condition)
    ? (raw.condition as Condition)
    : "New";
  // An LGA that does not belong to the state is dropped rather than kept wrong,
  // for exactly the reason the picker refuses it: the id is namespaced.
  const lgaRaw = str(raw.lga).trim();
  const lga = lgaRaw.includes(`${getStateByName(state)?.id}/`) ? lgaRaw : "";
  const status: ListingStatus = raw.status === "draft" ? "draft" : "live";
  const iso = (v: unknown) =>
    typeof v === "string" && !Number.isNaN(Date.parse(v))
      ? v
      : new Date().toISOString();
  return {
    id: str(raw.id) || `ad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title,
    price,
    categorySlug,
    condition,
    description: str(raw.description).trim(),
    state,
    lga,
    town: str(raw.town).trim(),
    photoKeys: keysOf(raw.photoKeys),
    status,
    createdAt: iso(raw.createdAt),
    updatedAt: iso(raw.updatedAt),
  };
}

function read(): Listing[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitize).filter((l): l is Listing => l !== null).slice(0, MAX_LISTINGS);
  } catch {
    return [];
  }
}

function newId(existing: Listing[]): string {
  let id = "";
  do {
    id = `ad-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  } while (existing.some((l) => l.id === id));
  return id;
}

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setListings(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // Once per load, against the set just read. Deliberately not tied to
    // `listings`: re-running on every save would scan the whole photo store for
    // no benefit, and the age test is what protects an open composer, not timing.
    void sweepAbandonedPhotos(
      new Set(listings.flatMap((l) => l.photoKeys)),
      ABANDONED_AFTER_MS,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch {
      /* quota or private mode: the session still works from memory */
    }
  }, [listings, hydrated]);

  const validate = useCallback((draft: ListingDraft) => {
    const errors: Partial<Record<keyof ListingDraft, string>> = {};
    if (!draft.title.trim()) errors.title = "Say what you are selling.";
    else if (draft.title.trim().length < 5) errors.title = "Use a few more words.";
    if (!Number.isFinite(draft.price) || draft.price <= 0) {
      errors.price = "Enter a price in Naira.";
    } else if (draft.price > 1_000_000_000) {
      errors.price = "That price looks too large.";
    }
    if (!CATEGORY_SLUGS.has(draft.categorySlug)) {
      errors.categorySlug = "Pick a category.";
    }
    if (!LISTING_CONDITIONS.includes(draft.condition)) {
      errors.condition = "Pick a condition.";
    }
    if (!draft.description.trim()) errors.description = "Describe the item.";
    if (!canonicalState(draft.state)) errors.state = "Pick the state you are in.";
    if (draft.lga && !draft.lga.includes(`${getStateByName(draft.state)?.id}/`)) {
      errors.lga = "That area is not in the selected state.";
    }
    if (draft.photoKeys.length === 0) {
      errors.photoKeys = "Add at least one photo.";
    }
    return errors;
  }, []);

  const addListing = useCallback(
    (draft: ListingDraft, publish: boolean): Listing | null => {
      if (Object.keys(validate(draft)).length > 0) return null;
      const now = new Date().toISOString();
      const entry: Listing = {
        ...draft,
        title: draft.title.trim(),
        price: Math.round(draft.price),
        description: draft.description.trim(),
        state: canonicalState(draft.state),
        town: draft.town.trim(),
        photoKeys: keysOf(draft.photoKeys),
        id: newId(listings),
        status: publish ? "live" : "draft",
        createdAt: now,
        updatedAt: now,
      };
      setListings((prev) => [entry, ...prev].slice(0, MAX_LISTINGS));
      return entry;
    },
    [listings, validate],
  );

  const updateListing = useCallback(
    (id: string, draft: ListingDraft): Listing | null => {
      if (Object.keys(validate(draft)).length > 0) return null;
      const target = listings.find((l) => l.id === id);
      if (!target) return null;
      const next: Listing = {
        ...target,
        ...draft,
        title: draft.title.trim(),
        price: Math.round(draft.price),
        description: draft.description.trim(),
        state: canonicalState(draft.state),
        town: draft.town.trim(),
        photoKeys: keysOf(draft.photoKeys),
        id: target.id,
        createdAt: target.createdAt,
        status: target.status,
        updatedAt: new Date().toISOString(),
      };
      setListings((prev) => prev.map((l) => (l.id === id ? next : l)));
      return next;
    },
    [listings, validate],
  );

  const setStatus = useCallback((id: string, status: ListingStatus) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l,
      ),
    );
  }, []);

  const removeListing = useCallback(
    (id: string) => {
      const target = listings.find((l) => l.id === id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      // The pixels go with the record. `deletePhotos` reports failure rather
      // than throwing, so a stuck delete leaves an orphan that `sweepPhotos`
      // picks up next time, instead of breaking the button.
      if (target && target.photoKeys.length > 0) {
        void deletePhotos(target.photoKeys);
      }
    },
    [listings],
  );

  const referencedKeys = useCallback(
    () => new Set(listings.flatMap((l) => l.photoKeys)),
    [listings],
  );

  const sweepPhotos = useCallback(async () => {
    const { removed } = await sweepOrphanPhotos(referencedKeys());
    return removed;
  }, [referencedKeys]);

  const unusedPhotoCount = useCallback(async () => {
    const referenced = referencedKeys();
    const ages = await listPhotoAges();
    return ages.filter((entry) => !referenced.has(entry.key)).length;
  }, [referencedKeys]);

  const getById = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  );

  const value = useMemo<ListingsContextValue>(() => {
    const byNewest = (a: Listing, b: Listing) =>
      b.updatedAt.localeCompare(a.updatedAt);
    const mine = [...listings].sort(byNewest);
    return {
      listings,
      hydrated,
      myListings: mine,
      liveListings: mine.filter((l) => l.status === "live"),
      getById,
      addListing,
      updateListing,
      setStatus,
      removeListing,
      validate,
      sweepPhotos,
      unusedPhotoCount,
    };
  }, [
    listings,
    hydrated,
    getById,
    addListing,
    updateListing,
    setStatus,
    removeListing,
    validate,
    sweepPhotos,
    unusedPhotoCount,
  ]);

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings(): ListingsContextValue {
  const ctx = useContext(ListingsContext);
  if (!ctx) {
    throw new Error("useListings must be used within a ListingsProvider");
  }
  return ctx;
}

/** Text used on cards: "Ikeja, Lagos". Falls back through town, LGA, state. */
export function listingPlace(listing: Listing): string {
  const lgaName = listing.lga ? getLga(listing.lga)?.name ?? "" : "";
  const area = listing.town || lgaName;
  return [area, listing.state].filter(Boolean).join(", ");
}
