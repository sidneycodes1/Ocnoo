"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useQuickAdd } from "@/components/product/useQuickAdd";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ProductCardMeta from "@/components/product/ProductCardMeta";
import ProductImage from "@/components/product/ProductImage";
import SaveButton from "@/components/ui/SaveButton";
import { CheckIcon, PlusIcon } from "@/components/ui/icons";

// The photo box: real Storage photo when the listing has one, the placeholder
// frame when it does not. The outer box clips; the inner one is what scales on
// card hover, so the zoom can never bleed over the title underneath it.
function ImageFrame({ product }: { product: Product }) {
  return (
    <div className="aspect-square w-full overflow-hidden bg-surface">
      <div className="h-full w-full transition-transform duration-300 ease-out motion-safe:lg-hover:group-hover:scale-[1.05]">
        <ProductImage
          paths={product.images}
          alt={product.name}
          className="h-full w-full bg-surface"
          iconSize={48}
          label="No photo yet"
        />
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
          {added ? <CheckIcon size={20} /> : <PlusIcon size={20} />}
        </button>
      </div>

      <Link
        href={`/product/${product.slug}`}
        className="flex flex-1 flex-col"
        aria-label={product.name}
      >
        <ImageFrame product={product} />
        <ProductCardMeta
          product={product}
          showDescription
          desktopUppercase
          className="p-2 md:p-3"
        />
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
