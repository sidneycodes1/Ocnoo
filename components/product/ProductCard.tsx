"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

// Placeholder photo frame: no real image files exist yet (added later),
// so we render an on-brand black-bordered frame instead of a broken <img>.
function ImageFrame() {
  return (
    <div className="flex aspect-square w-full items-center justify-center border-b-2 border-black bg-white">
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
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Card className="relative flex h-full flex-col overflow-hidden">
      {product.badge && (
        <div className="absolute left-0 top-0 z-10 m-2">
          <Badge>{product.badge}</Badge>
        </div>
      )}

      <Link
        href={`/product/${product.slug}`}
        className="flex flex-col"
        aria-label={product.name}
      >
        <ImageFrame />
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="font-sans text-sm font-bold uppercase leading-tight">
            {product.name}
          </h3>
          <p className="line-clamp-1 font-sans text-xs">{product.description}</p>
          <p className="mt-auto pt-2 font-mono text-base">
            {formatNaira(product.price)}
          </p>
        </div>
      </Link>

      <div className="mt-auto p-3 pt-0">
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
