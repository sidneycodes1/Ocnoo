import type { Product } from "@/types";
import ProductTile from "@/components/product/ProductTile";
import { DESKTOP_TILES, MOBILE_TILES, type TileGeometry } from "@/lib/tiles";

/**
 * Which waterfall this is. One knob picks both the column classes and the
 * geometry, so the two cannot be pointed at different breakpoints - and the
 * classes are written out in full here because Tailwind only generates a
 * utility it can read as a literal string in a scanned file.
 */
export type WallKind = "mobile" | "desktop";

const WALLS: Record<WallKind, { columnsClass: string; geometry: TileGeometry }> =
  {
    mobile: { columnsClass: "grid-cols-2", geometry: MOBILE_TILES },
    desktop: { columnsClass: "grid-cols-3 lg:grid-cols-4", geometry: DESKTOP_TILES },
  };

interface ProductTileGridProps {
  products: Product[];
  /** Which waterfall this grid is. Defaults to the mobile one. */
  wall?: WallKind;
}

/**
 * The waterfall grid on its own, with no heading. The home page reaches for
 * ProductWall (this plus a section title); a collection page uses this directly
 * because it already has an <h1>.
 *
 * The gap and the row unit are inline styles deliberately: they are the numbers
 * tilePlan() divides by, and a Tailwind class would be a second source of truth
 * that can drift away from the arithmetic - which fails silently, because the
 * tiles still render, just mis-stacked.
 *
 * The gap is written as `0 <gap>` on purpose: the gutter is applied between
 * columns only, and the row axis leaves it to each tile's own span. A row-gap
 * here would make every vertical gutter land anywhere up to a whole row-plus-gap
 * short of the design, which reads as an uneven wall.
 */
export default function ProductTileGrid({
  products,
  wall = "mobile",
}: ProductTileGridProps) {
  if (products.length === 0) return null;

  const { columnsClass, geometry } = WALLS[wall];

  return (
    <ul
      className={`grid ${columnsClass}`}
      style={{ gap: `0px ${geometry.gap}px`, gridAutoRows: geometry.rowUnit }}
    >
      {products.map((product) => (
        <ProductTile key={product.id} product={product} geometry={geometry} />
      ))}
    </ul>
  );
}
