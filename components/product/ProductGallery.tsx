"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/types";
import ProductImage from "@/components/product/ProductImage";
import { ChevronRightIcon } from "@/components/ui/icons";

interface ProductGalleryProps {
  product: Product;
  /**
   * One caption per listing slot, from the listing's extras ("Lid open",
   * "Ports"). They survive as alt text and as the placeholder caption, because
   * a photo carries no words of its own - the labels are what a screen reader
   * and a pre-photo listing both need.
   */
  labels?: string[];
}

/**
 * The image column.
 *
 * The slots are whatever the admin actually uploaded (`product.images`); the
 * labels only name them. A listing with no photo keeps a single placeholder
 * frame, because several identically empty frames would suggest there is
 * something to page through.
 *
 * The save disc used to sit over the top-right of the frame on mobile only; it
 * now belongs to the buy box at every width, so there is exactly one control
 * per function on the page.
 *
 * One strip serves both breakpoints instead of the old duplicated desktop grid
 * and mobile row. It scrolls horizontally at any width, and the `‹ ›` nudges
 * only appear on a device with a real cursor AND more slots than fit — on a
 * phone the strip is swipeable, so nudges would be decoration.
 */
export default function ProductGallery({ product, labels }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const count = Math.max(product.images.length, 1);
  const current = Math.min(active, count - 1);
  const label = labels?.[current] ?? "";

  // Measure rather than guess a slot count: whether six 56px thumbs overflow the
  // strip depends on the column width, which changes with every breakpoint.
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const measure = () =>
      setOverflowing(strip.scrollWidth > strip.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(strip);
    return () => observer.disconnect();
  }, [count]);

  function nudge(direction: -1 | 1) {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({ left: direction * strip.clientWidth * 0.6 });
  }

  return (
    <div className="-mx-4 flex flex-col gap-3 md:mx-0 md:gap-3">
      <div className="relative">
        <ProductImage
          paths={product.images}
          index={current}
          alt={label ? `${product.name} — ${label}` : product.name}
          iconSize={72}
          label={label || "No photo yet"}
          priority
          className="aspect-square w-full bg-surface md:rounded-xl md:shadow-soft"
        />

        {/* Only appears once a listing actually carries several photos. */}
        {count > 1 && (
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-1 font-sans text-[11px] font-semibold text-white">
            {current + 1} of {count}
          </span>
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center gap-2">
          {/* Nudges appear only when the strip actually overflows AND the device
              has a real cursor. `hidden lg-hover:flex` is what keeps them out of
              the keyboard ring on touch: a display:none button is not a tab
              stop, and a phone visitor swipes the strip instead. */}
          <button
            type="button"
            aria-label="Previous images"
            onClick={() => nudge(-1)}
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-black/60 shadow-soft ${
              overflowing ? "lg-hover:flex" : ""
            }`}
          >
            <ChevronRightIcon size={16} className="rotate-180" />
          </button>

          <div
            ref={stripRef}
            role="group"
            aria-label="Product images"
            className="no-scrollbar flex flex-1 snap-x gap-2 overflow-x-auto"
          >
            {Array.from({ length: count }, (_, i) => (
              <button
                key={product.images[i] ?? `slot-${i}`}
                type="button"
                onClick={() => setActive(i)}
                aria-label={
                  labels?.[i]
                    ? `View ${labels[i]}`
                    : `View image ${i + 1} of ${count}`
                }
                aria-pressed={i === current}
                className={
                  "h-14 w-14 shrink-0 snap-start overflow-hidden rounded-lg border transition-colors md:h-[72px] md:w-[72px] " +
                  (i === current
                    ? "border-primary bg-tint-lavender"
                    : "border-line bg-white hover:border-black/30")
                }
              >
                {/* The thumb-named variant, so a six-photo listing does not
                    download six full-size images just to draw the strip. */}
                <ProductImage
                  paths={product.images}
                  index={i}
                  variant="thumb"
                  alt=""
                  iconSize={20}
                  className="h-full w-full bg-surface"
                />
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-label="More images"
            onClick={() => nudge(1)}
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-black/60 shadow-soft ${
              overflowing ? "lg-hover:flex" : ""
            }`}
          >
            <ChevronRightIcon size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
