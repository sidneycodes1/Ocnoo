"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useQuickAdd } from "@/components/product/useQuickAdd";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PriceTag from "@/components/ui/PriceTag";
import SaveButton from "@/components/ui/SaveButton";
import { PlusIcon } from "@/components/ui/icons";

// Placeholder photo frame: no real image files exist yet (added later),
// so we render an on-brand soft-grey tile instead of a broken <img>.
// The outer box clips; the inner one is what scales on card hover, so the
// zoom can never bleed over the title underneath it.
function ImageFrame() {
  return (
    <div className="aspect-square w-full overflow-hidden bg-surface">
      <div className="flex h-full w-full items-center justify-center transition-transform duration-300 ease-out motion-safe:lg-hover:group-hover:scale-[1.05]">
        <div className="flex flex-col items-center gap-2 text-black">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span className="font-sans text-[10px] uppercase tracking-[0.2em]">
            Photo coming
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  // Shared with the waterfall tile, so the added-tick behaviour cannot
  // drift between the two shapes of the same card.
  const { added, quickAdd } = useQuickAdd(product);

  return (
    // The hairline border stays at every width now: the card tone is only ~3 L*
    // above the page canvas, so removing it would let cards dissolve into the
    // background. `bordered` drops the mobile shadow; `md:shadow-soft` puts it
    // back for desktop.
    //
    // Hover is gated on the `lg-hover` screen, which is `(hover: hover) and
    // (min-width: 768px)` - desktop AND a real cursor - plus `motion-safe:` for
    // prefers-reduced-motion. The lift is 10px, not 4px: at 4px the card
    // visually did nothing on hover, which was the complaint. The card also
    // carries `hover:shadow-soft-hover` from Card; both are single-class hover
    // rules, so the winner is decided by position in the generated stylesheet,
    // not by this class attribute. The multi-variant `shadow-lift` rule is
    // emitted after it (verified against the compiled CSS), so the lift shadow
    // wins. If that ordering ever changes, this card silently falls back to the
    // weaker shadow.
    <Card
      bordered
      className="group relative flex h-full flex-col overflow-hidden motion-safe:lg-hover:hover:-translate-y-2.5 motion-safe:lg-hover:hover:shadow-lift md:shadow-soft"
    >
      {product.badge && (
        <div className="absolute left-0 top-0 z-10 m-2">
          <Badge>{product.badge}</Badge>
        </div>
      )}

      {/* Save control, anchored inside the card so the Card's overflow-hidden
          cannot clip it. It used to be `md:hidden`, which made /saved a dead
          end on desktop: that page renders this grid, and the only way to
          un-save a product was a control its own cards hid. */}
      <div className="absolute right-0 top-0 z-10">
        <SaveButton productId={product.id} productName={product.name} />
      </div>

      {/* Quick add. It cannot live inside the image - the image is wrapped by
          the card's <Link>, and a <button> nested in an <a> is invalid - so it
          sits in a transparent overlay that mirrors the image box exactly
          (`inset-x-0 top-0 aspect-square`, the same geometry ImageFrame gets as
          the card's first full-width child). Only the button takes pointer
          events; the rest of the overlay lets taps fall through to the link.
          Desktop keeps the full Add-to-Cart button below instead. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 aspect-square md:hidden">
        <button
          type="button"
          onClick={quickAdd}
          disabled={!product.inStock}
          aria-label={`Add ${product.name} to cart`}
          className="pointer-events-auto absolute bottom-1.5 right-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-soft active:scale-95 disabled:opacity-40 motion-safe:transition-transform motion-safe:duration-150"
        >
          {added ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <PlusIcon size={20} />
          )}
        </button>
      </div>

      <Link
        href={`/product/${product.slug}`}
        className="flex flex-1 flex-col"
        aria-label={product.name}
      >
        <ImageFrame />
        <div className="flex flex-1 flex-col gap-1 p-2 md:p-3">
          <h3 className="line-clamp-2 font-sans text-sm font-bold leading-tight md:uppercase">
            {product.name}
          </h3>
          {/* Description + Add-to-Cart are desktop-only chrome; mobile stays image-forward. */}
          <p className="hidden line-clamp-1 font-sans text-xs md:block">
            {product.description}
          </p>
          <p className="mt-auto pt-1 md:pt-2">
            <PriceTag
              price={product.price}
              oldPrice={product.oldPrice}
              tone="shell"
            />
          </p>
        </div>
      </Link>

      <div className="mt-auto hidden p-3 pt-0 md:block">
        <Button
          variant="secondary"
          className="w-full"
          disabled={!product.inStock}
          onClick={() => addItem(product.id, 1)}
        >
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </div>
    </Card>
  );
}
