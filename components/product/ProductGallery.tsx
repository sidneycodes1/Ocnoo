"use client";

import { useState } from "react";
import type { Product } from "@/types";

// Placeholder gallery: no real photos exist yet, so each "image" is an
// on-brand frame. Once real photos are dropped into /public/images, swap the
// frame for <Image src={product.images[active]} ... /> — selection logic stays.
export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const count = Math.max(product.images.length, 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex aspect-square w-full items-center justify-center bg-surface rounded-xl shadow-soft">
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

      {count > 1 && (
        <div className="grid grid-cols-5 gap-2">
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
    </div>
  );
}
