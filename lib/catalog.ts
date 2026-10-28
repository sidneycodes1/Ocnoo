import { cache } from "react";
import type { Condition, Product } from "@/types";
import { products as seedProducts } from "@/data/products";
import { getCollectionMeta, type CollectionMeta } from "@/data/collectionMeta";
import { getServerClient } from "@/lib/supabase";

/**
 * Server-only reads of the shared catalogue. The admin writes to the same
 * `products` table, and row-level security is what keeps a draft out of the
 * shop: the anon key can only ever select `status = 'published'`.
 *
 * `cache()` dedupes the query across the layout, the page and the metadata for
 * one render — the storefront asks for the catalogue several times per request.
 */

const PUBLIC_COLUMNS =
  "id, slug, name, price, compare_at, category, description, brand, condition, badge, specs, images, stock_qty, rating, review_count, created_at, published_at";

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  price: number;
  compare_at: number | null;
  category: string;
  description: string;
  brand: string | null;
  condition: Condition | null;
  badge: string | null;
  specs: { label: string; value: string }[] | null;
  images: string[] | null;
  stock_qty: number;
  rating: number | null;
  review_count: number | null;
  created_at: string;
  published_at: string | null;
}

const BADGES = ["New", "Deal", "Pre-Order"] as const;
type Badge = (typeof BADGES)[number];

function asBadge(value: string | null): Badge | undefined {
  return BADGES.find((badge) => badge === value);
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    price: row.price,
    oldPrice: row.compare_at ?? undefined,
    category: row.category,
    images: Array.isArray(row.images) ? row.images : [],
    description: row.description,
    badge: asBadge(row.badge),
    // Stock is the single source of truth; `inStock` is derived so every card,
    // row and buy box keeps working without learning about stock_qty.
    inStock: row.stock_qty > 0,
    brand: row.brand ?? undefined,
    condition: row.condition ?? undefined,
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? undefined,
    specs: Array.isArray(row.specs) ? row.specs : [],
    stockQty: row.stock_qty,
    publishedAt: row.published_at ?? row.created_at,
  };
}

/**
 * Every published product, newest first.
 *
 * If the database is unreachable — the free tier pauses an idle project — or
 * the env vars are not set yet, the catalogue baked into the build is served
 * instead. A client demo must not open on an empty shop because of a paused
 * database; the console warning is the honest part.
 */
export const getPublishedProducts = cache(async (): Promise<Product[]> => {
  const client = getServerClient();
  if (!client) {
    // Loud on purpose. Serving the built-in catalogue looks identical to serving
    // the real one, so a storefront with no env vars quietly stops showing what
    // the admin publishes - which reads as a broken publish button, not as a
    // missing configuration.
    console.warn(
      "[catalog] Supabase is not configured, serving the built-in demo catalogue. Products published in the admin panel will not appear.",
    );
    return seedProducts;
  }

  const { data, error } = await client
    .from("products")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(`[catalog] falling back to the built-in catalogue: ${error.message}`);
    return seedProducts;
  }

  return (data as ProductRow[]).map(rowToProduct);
});

export const getProductBySlug = cache(async (slug: string): Promise<Product | undefined> => {
  const all = await getPublishedProducts();
  return all.find((product) => product.slug === slug);
});

/**
 * A collection is a real ordering over the whole published catalogue rather
 * than a hand-picked set, so the home row and the page behind its "More" link
 * can never disagree — they are the same array, sliced.
 */
export function orderForCollection(list: Product[], key: string): Product[] {
  const copy = [...list];
  switch (key) {
    case "top-rated":
      return copy.sort(
        (a, b) =>
          (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
      );
    case "popular-right-now":
      return copy.sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0));
    case "just-in":
      return copy.sort(
        (a, b) => Date.parse(b.publishedAt ?? "") - Date.parse(a.publishedAt ?? ""),
      );
    default:
      return copy;
  }
}

export interface ResolvedCollection extends CollectionMeta {
  /** The whole catalogue, in this collection's order. What the page shows. */
  products: Product[];
  /** The slice the home row shows. */
  home: Product[];
}

export function resolveCollection(list: Product[], meta: CollectionMeta): ResolvedCollection {
  const ordered = orderForCollection(list, meta.key);
  return { ...meta, products: ordered, home: ordered.slice(0, meta.homeSize) };
}

export async function getCollection(key: string): Promise<ResolvedCollection | undefined> {
  const meta = getCollectionMeta(key);
  if (!meta) return undefined;
  return resolveCollection(await getPublishedProducts(), meta);
}

/** Published products per category slug, for the mobile category list. */
export function countByCategory(list: Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const product of list) {
    counts[product.category] = (counts[product.category] ?? 0) + 1;
  }
  return counts;
}
