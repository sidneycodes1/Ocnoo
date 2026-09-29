"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { formatNaira } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import ProductGallery from "@/components/product/ProductGallery";
import MobileStickyBar from "@/components/layout/MobileStickyBar";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function ProductDetail({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(product.id, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery product={product} />

        <div className="flex flex-col gap-4">
          {product.badge && (
            <div>
              <Badge>{product.badge}</Badge>
            </div>
          )}

          <h1 className="font-sans text-3xl font-extrabold uppercase leading-tight">
            {product.name}
          </h1>

          <p className="font-mono text-2xl">{formatNaira(product.price)}</p>

          <p className="font-sans text-base leading-relaxed">
            {product.description}
          </p>

          <p className="font-sans text-sm font-bold uppercase tracking-wide">
            {product.inStock ? "In stock" : "Currently unavailable"}
          </p>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="font-sans text-sm font-bold uppercase tracking-wide">
              Qty
            </span>
            <div className="inline-flex items-center border-2 border-black">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 text-xl font-bold hover:bg-black hover:text-white"
              >
                &minus;
              </button>
              <span className="flex h-11 w-12 items-center justify-center border-x-2 border-black font-mono">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="h-11 w-11 text-xl font-bold hover:bg-black hover:text-white"
              >
                +
              </button>
            </div>
          </div>

          {/* Desktop / tablet action (mobile uses the sticky bar) */}
          <div className="hidden gap-3 pt-4 md:flex">
            <Button
              variant="primary"
              disabled={!product.inStock}
              onClick={handleAdd}
            >
              {added ? "Added \u2713" : "Add to Cart"}
            </Button>
            <WhatsAppButton label="Chat to Order" />
          </div>
        </div>
      </div>

      {product.inStock && (
        <MobileStickyBar onAddToCart={handleAdd} disabled={!product.inStock} />
      )}

      {/* Spacer so the fixed mobile bar never overlaps the footer/content */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
