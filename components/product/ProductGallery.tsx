"use client";

import { useState } from "react";
import type { Product } from "@/types";
import SaveButton from "@/components/ui/SaveButton";

// Placeholder gallery: no real photos exist yet, so each "image" is an
// on-brand frame. Once real photos are dropped into /public/images, swap the
// frame for <Image src={product.images[active]} ... /> — selection logic,
// the "1 of n" chip and the save disc all stay.
export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const count = Math.max(product.images.length, 1);

  return (
    <div className="-mx-4 flex flex-col gap-3 md:mx-0 md:gap-3">
      <div className="relative">
        <div className="flex aspect-square w-full items-center justify-center bg-surface md:rounded-xl md:shadow-soft">
          <div className="flex flex-col items-center gap-3 text-black">
            <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="font-sans text-xs uppercase tracking-[0.2em]">
              {product.name} — photo coming
            </span>
          </div>
        </div>

        {/* Mobile-only overlays: desktop has no approved design for these yet. */}
        <div className="absolute bottom-3 right-3 z-10 md:hidden">
          <SaveButton
            productId={product.id}
            productName={product.name}
            variant="disc"
          />
        </div>

        {/* Only appears once a listing actually carries several photos. */}
        {count > 1 && (
          <span className="absolute bottom-3 left-3 z-10 rounded-full bg-black/60 px-2.5 py-1 font-sans text-[11px] font-semibold text-white md:hidden">
            {active + 1} of {count}
          </span>
        )}
      </div>

      {count > 1 && (
        <div className="hidden grid-cols-5 gap-2 md:grid">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={
                "flex aspect-square items-center justify-center rounded-lg border border-line " +
                (i === active ? "bg-black text-white" : "bg-white text-black")
              }
            >
              <span className="font-mono text-sm">{i + 1}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mobile thumbnail strip — same selection state, reference styling. */}
      {count > 1 && (
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:hidden">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === active}
              className={
                "flex h-14 w-14 shrink-0 snap-start items-center justify-center rounded-lg border " +
                (i === active ? "border-primary bg-tint-lavender" : "border-line bg-white")
              }
            >
              <span className="font-mono text-sm">{i + 1}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
