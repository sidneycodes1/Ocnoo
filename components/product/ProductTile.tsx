"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import type { Product } from "@/types";
import Badge from "@/components/ui/Badge";
import ProductCardMeta from "@/components/product/ProductCardMeta";
import ProductImage from "@/components/product/ProductImage";
import SaveButton from "@/components/ui/SaveButton";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";
import { useQuickAdd } from "@/components/product/useQuickAdd";
import { MOBILE_TILES, tilePlan, type TileGeometry } from "@/lib/tiles";

interface ProductTileProps {
  product: Product;
  /** Which waterfall this tile is standing in. Defaults to the mobile one. */
  geometry?: TileGeometry;
}

/**
 * One tile in a product waterfall.
 *
 * It renders as an <li>, so its parent must be the <ul> ProductTileGrid
 * provides - that element carries the grid-row span. The shape exists at all
 * because a staggered grid needs a fixed-height image box and a caption box
 * whose height the span arithmetic can trust.
 *
 * Every dimension comes from `geometry`, and the grid it sits in comes from the
 * same preset, so a tile can never be sized for one layout while its parent is
 * laid out for another.
 */
export default function ProductTile({
  product,
  geometry = MOBILE_TILES,
}: ProductTileProps) {
  const { added, quickAdd } = useQuickAdd(product);
  // The compare-at price is what decides how tall the caption has to be, so the
  // plan has to know about it.
  const plan = tilePlan(product.id, product.oldPrice !== undefined, geometry);
  const imageStyle: CSSProperties = { height: plan.imageHeight };

  return (
    // `self-start` stops the tile stretching to fill its spanned rows, so the
    // few px of rounding slack in the span becomes gutter rather than an empty
    // strip inside the card.
    <li
      style={{ gridRow: `span ${plan.rowSpan} / span ${plan.rowSpan}` }}
      className="relative self-start overflow-hidden rounded-xl border border-line bg-white"
    >
      {product.badge && (
        <div className="absolute left-0 top-0 z-10 m-2">
          <Badge>{product.badge}</Badge>
        </div>
      )}

      <div className="absolute right-0 top-0 z-10">
        <SaveButton productId={product.id} productName={product.name} />
      </div>

      {/* Quick add, sized to exactly the image box so the disc can never sit off
          the picture. The overlay passes pointer events through everywhere
          except the button, so taps still reach the product link underneath -
          a <button> cannot simply be nested inside the <a>. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={imageStyle}
      >
        <button
          type="button"
          onClick={quickAdd}
          disabled={!product.inStock}
          aria-label={`Add ${product.name} to cart`}
          className="pointer-events-auto absolute bottom-1.5 right-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-soft active:scale-95 disabled:opacity-40 motion-safe:transition-transform motion-safe:duration-150"
        >
          {added ? <CheckIcon size={20} /> : <PlusIcon size={20} />}
        </button>
      </div>

      <Link
        href={`/product/${product.slug}`}
        aria-label={product.name}
        className="flex flex-col"
      >
        {/* The same helper the desktop card uses. This block used to draw a
            hardcoded "Photo coming" glyph, so a listing with four real photos
            still showed the placeholder - the tile never looked at
            `product.images`. The box keeps its computed height so the row-span
            arithmetic above stays exact whether or not a photo resolves. */}
        <div style={imageStyle} className="overflow-hidden bg-surface">
          <ProductImage
            paths={product.images}
            alt={product.name}
            variant="thumb"
            className="h-full w-full bg-surface"
            iconSize={geometry.placeholderSize}
            label="Photo coming"
          />
        </div>

        {/* minHeight, not height: the reserved box is what the span was computed
            from, and a caption that ever needs more must grow visibly rather
            than have its price clipped. The block itself is shared with the
            desktop card, so the rating row cannot go missing on one surface.
            `flex flex-col` is what lets that shared block's `mt-auto` actually
            pin the price to the bottom of the reserve — without a flex parent
            the reserve just pooled underneath it as up to 55px of dead card. */}
        <div
          style={{ minHeight: plan.captionHeight, padding: plan.captionPadding }}
          className="flex flex-col"
        >
          <ProductCardMeta product={product} size="sm" />
        </div>
      </Link>
    </li>
  );
}
