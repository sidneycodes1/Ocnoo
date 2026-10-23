import type { Product } from "@/types";
import SectionHeader from "@/components/ui/SectionHeader";
import ProductTileGrid, { type WallKind } from "@/components/product/ProductTileGrid";

interface ProductWallProps {
  title: string;
  products: Product[];
  /** The collection page this row is a slice of. */
  moreHref?: string;
  /** Which waterfall to lay the section out as. */
  wall?: WallKind;
}

/**
 * A product section with a waterfall body: the same `Title …… More >` header
 * every home section uses, then the section's tiles. There is deliberately no
 * expander - "More >" opens the collection page, which holds the full list.
 *
 * No state lives here either, so this stays a server component and only the
 * tiles ship any JavaScript.
 */
export default function ProductWall({
  title,
  products,
  moreHref,
  wall = "mobile",
}: ProductWallProps) {
  if (products.length === 0) return null;

  return (
    <section aria-label={title}>
      <SectionHeader title={title} moreHref={moreHref} />
      <ProductTileGrid products={products} wall={wall} />
    </section>
  );
}
