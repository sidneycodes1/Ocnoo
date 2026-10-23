import type { Brand } from "@/types";
import { products } from "./products";

// Brands are derived from the product list rather than stored separately, so a
// brand can never be listed with no products behind it.
const UNBRANDED = "Generic";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Distinct brands, most products first, alphabetical on ties. */
export function getBrands(limit?: number): Brand[] {
  const counts: Record<string, number> = {};
  for (const p of products) {
    if (!p.brand || p.brand === UNBRANDED) continue;
    counts[p.brand] = (counts[p.brand] ?? 0) + 1;
  }

  const list: Brand[] = Object.keys(counts).map((name) => ({
    name,
    slug: slugify(name),
    productCount: counts[name],
  }));

  list.sort(
    (a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name)
  );

  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return getBrands().find((b) => b.slug === slug);
}
