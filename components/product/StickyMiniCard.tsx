"use client";

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import type { Product } from "@/types";
import Button from "@/components/ui/Button";
import PriceTag from "@/components/ui/PriceTag";
import ProductImage from "@/components/product/ProductImage";
import { CartIcon } from "@/components/ui/icons";

interface StickyMiniCardProps {
  product: Product;
  /** The buy box's own action row. Reveals this card once it scrolls away. */
  anchorRef: RefObject<HTMLDivElement | null>;
  added: boolean;
  onAdd: () => void;
}

/**
 * The compact purchase card that pins in the right rail.
 *
 * It appears only after the real Add-to-cart row in the buy box has scrolled up
 * past the viewport, which is what keeps the page from ever offering two live
 * buttons — the reference does the same, and the alternative (both always
 * visible) leaves a shopper unsure which one they just pressed.
 *
 * `hidden lg:block` is load-bearing for more than layout: on smaller widths the
 * fixed MobileStickyBar is the persistent action, so a second one here would
 * stack.
 */
export default function StickyMiniCard({
  product,
  anchorRef,
  added,
  onAdd,
}: StickyMiniCardProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // "Scrolled past", not merely "not visible": the card must not appear
        // before the shopper has ever seen the real button.
        setShow(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [anchorRef, product.id]);

  // Not rendered at all rather than rendered invisible: a hidden-but-mounted
  // card would still reserve its ~150px in the rail, and a focusable Add to
  // cart that nobody can see is exactly the trap this page is trying to avoid.
  if (!show) return null;

  return (
    <div className="hidden rounded-xl border border-line bg-white p-3 lg:block">
      <div className="flex gap-3">
        <ProductImage
          paths={product.images}
          alt={product.name}
          variant="thumb"
          iconSize={22}
          className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-surface"
        />
        <div className="min-w-0">
          <p className="line-clamp-2 font-sans text-sm font-bold leading-snug">
            {product.name}
          </p>
          <p className="mt-1">
            <PriceTag
              price={product.price}
              oldPrice={product.oldPrice}
              tone="shell"
              size="sm"
            />
          </p>
        </div>
      </div>

      <Button
        variant="primary"
        disabled={!product.inStock}
        onClick={onAdd}
        className="mt-3 w-full gap-2"
      >
        <CartIcon size={18} />
        {added ? "Added \u2713" : "Add to Cart"}
      </Button>
    </div>
  );
}
