import type { Brand, Product } from "@/types";
import { brandSlug } from "@/lib/utils";

// Brands are derived from the catalogue rather than stored separately, so a
// brand can never be listed with no products behind it — unpublish the last
// product of a brand and the brand stops existing too.
const UNBRANDED = "Generic";

/** Distinct brands, most products first, alphabetical on ties. */
export function getBrands(products: Product[], limit?: number): Brand[] {
  const counts: Record<string, number> = {};
  for (const product of products) {
    if (!product.brand || product.brand === UNBRANDED) continue;
    counts[product.brand] = (counts[product.brand] ?? 0) + 1;
  }

  const list: Brand[] = Object.keys(counts).map((name) => ({
    name,
    slug: brandSlug(name),
    productCount: counts[name],
  }));

  list.sort(
    (a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name)
  );

  return typeof limit === "number" ? list.slice(0, limit) : list;
}

export function getBrandBySlug(products: Product[], slug: string): Brand | undefined {
  return getBrands(products).find((brand) => brand.slug === slug);
}
