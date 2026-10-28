import type { Product } from "@/types";
import PriceTag from "@/components/ui/PriceTag";
import Rating from "@/components/ui/Rating";

interface ProductCardMetaProps {
  product: Product;
  /** Price and type scale. The waterfall tile is the tight one. */
  size?: "sm" | "md";
  /** Desktop cards carry a one-line description; tiles stay image-forward. */
  showDescription?: boolean;
  /** Card titles are uppercase from `md` up; tile titles stay sentence case. */
  desktopUppercase?: boolean;
  className?: string;
}

/**
 * The text block under a product image: name, rating, price.
 *
 * It exists so the card and the waterfall tile cannot drift — the same reason
 * `useQuickAdd` is shared. Both used to hand-roll this block, and the tile had
 * quietly lost its rating row, which is the single field that tells a shopper
 * whether a listing is worth opening.
 *
 * `ProductListRow` deliberately does NOT use it: a results row already renders
 * the same three fields in a horizontal layout, and its `trailing` slot carries
 * a cart line total rather than the product's own price. Folding that in would
 * mean a prop for every difference and no shared behaviour left to gain.
 */
export default function ProductCardMeta({
  product,
  size = "md",
  showDescription = false,
  desktopUppercase = false,
  className = "",
}: ProductCardMetaProps) {
  return (
    <div className={`flex flex-1 flex-col gap-1 ${className}`}>
      <h3
        className={`line-clamp-2 font-sans text-sm font-bold leading-tight ${
          desktopUppercase ? "md:uppercase" : ""
        }`}
      >
        {product.name}
      </h3>

      {showDescription && (
        /* `hidden md:line-clamp-1`, never `hidden line-clamp-1 md:block`.
           line-clamp works by setting `display:-webkit-box`, so an `md:block` on
           the same element overrides the clamp entirely and the "one line"
           description silently wrapped to three, leaving card bodies ragged.
           Here the two utilities own different ranges, so they cannot collide. */
        <p className="hidden font-sans text-xs md:line-clamp-1">
          {product.description}
        </p>
      )}

      {product.rating !== undefined && (
        <Rating
          value={product.rating}
          count={product.reviewCount}
          size={size === "sm" ? 12 : 14}
        />
      )}

      {/* `mt-auto` is what keeps prices on one line across a row of cards whose
          titles wrap differently. In the tile's fixed-height caption it is a
          no-op, which is why one component serves both. */}
      <p className="mt-auto pt-1 md:pt-2">
        <PriceTag
          price={product.price}
          oldPrice={product.oldPrice}
          tone="shell"
          size={size}
        />
      </p>
    </div>
  );
}
