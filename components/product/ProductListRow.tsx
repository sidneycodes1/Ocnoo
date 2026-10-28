import type { Product } from "@/types";
import Link from "next/link";
import { getCategoryBySlug } from "@/data/categories";
import ProductImage from "@/components/product/ProductImage";
import PriceTag from "@/components/ui/PriceTag";
import Rating from "@/components/ui/Rating";
import SaveButton from "@/components/ui/SaveButton";

interface ProductListRowProps {
  product: Product;
  /** Extra line under the title (defaults to "Brand • Condition"). */
  meta?: string;
  /** Rendered instead of the price, for surfaces that show a different total. */
  trailing?: React.ReactNode;
  /** Hide the hairline under the last row. */
  divider?: boolean;
  /**
   * Put a save toggle on the row. Only /saved asks for it: on a results list
   * every row is already saveable from its own card elsewhere, and a heart on
   * 19 rows is noise. Without it there was no way to un-save anything on a
   * phone, because the grid that carries the control is `hidden md:grid`.
   */
  showSave?: boolean;
}

// Dense full-width row used by mobile search results, cart and the "my items"
// lists. The reference switches from a card grid (browsing) to these rows
// (results), so this is a separate component rather than a ProductCard variant.
export default function ProductListRow({
  product,
  meta,
  trailing,
  divider = true,
  showSave = false,
}: ProductListRowProps) {
  const brand = product.brand ?? getCategoryBySlug(product.category)?.name;
  const line =
    meta ??
    [brand, product.condition && `Condition: ${product.condition}`]
      .filter(Boolean)
      .join(" • ");

  return (
    // The row IS a link, so the toggle cannot live inside it - a button cannot
    // be nested in an <a>. It sits beside the link in a positioned wrapper
    // instead, and the link reserves right padding so a two-line title clamps
    // before it reaches the control.
    <div className="relative">
      <Link
        href={`/product/${product.slug}`}
        className={`flex items-start gap-3 bg-white p-3 active:bg-page ${
          showSave ? "pr-14" : ""
        } ${divider ? "border-b border-line" : ""}`}
      >
        <ProductImage
          paths={product.images}
          alt={product.name}
          variant="thumb"
          iconSize={26}
          className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-line bg-surface"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="line-clamp-2 font-sans text-sm font-semibold leading-snug">
            {product.name}
          </h3>
          {line && (
            <p className="font-sans text-xs text-black/50">{line}</p>
          )}
          {product.rating !== undefined && (
            <Rating value={product.rating} count={product.reviewCount} />
          )}
          <div className="mt-auto pt-1">
            {trailing ?? (
              <PriceTag
                price={product.price}
                oldPrice={product.oldPrice}
                tone="shell"
              />
            )}
          </div>
        </div>
      </Link>
      {showSave && (
        <div className="absolute right-1.5 top-1.5 z-10">
          <SaveButton productId={product.id} productName={product.name} />
        </div>
      )}
    </div>
  );
}
