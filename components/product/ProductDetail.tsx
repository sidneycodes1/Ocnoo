"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { getCategoryBySlug } from "@/data/categories";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PriceTag from "@/components/ui/PriceTag";
import Rating from "@/components/ui/Rating";
import SpecTable from "@/components/ui/SpecTable";
import ProductGallery from "@/components/product/ProductGallery";
import MobileStickyBar from "@/components/layout/MobileStickyBar";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export default function ProductDetail({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  const categoryName = getCategoryBySlug(product.category)?.name;
  const metaLine = [product.brand, categoryName].filter(Boolean).join(" • ");
  const maxQty = product.stockQty && product.stockQty > 0 ? product.stockQty : 99;

  const handleAdd = () => {
    addItem(product.id, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product.id, qty);
    router.push("/checkout");
  };

  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 py-4 md:px-4 md:py-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <ProductGallery product={product} />

        <div className="flex flex-col gap-4">
          {product.badge && (
            <div>
              <Badge>{product.badge}</Badge>
            </div>
          )}

          <h1 className="font-sans text-2xl font-bold leading-snug md:text-3xl md:font-extrabold md:uppercase md:leading-tight">
            {product.name}
          </h1>

          {/* Meta + rating are new on mobile; desktop keeps its existing form. */}
          {metaLine && (
            <p className="font-sans text-sm text-black/50 md:hidden">
              {metaLine}
              {product.condition && ` • Condition: ${product.condition}`}
            </p>
          )}

          {product.rating !== undefined && (
            <Rating
              value={product.rating}
              count={product.reviewCount}
              className="md:hidden"
            />
          )}

          <PriceTag
            price={product.price}
            oldPrice={product.oldPrice}
            tone="shell"
            size="xl"
          />

          <p className="font-sans text-base leading-relaxed">
            {product.description}
          </p>

          <p className="font-sans text-sm font-bold uppercase tracking-wide">
            {product.inStock
              ? product.stockQty && product.stockQty <= 5
                ? `Only ${product.stockQty} left`
                : "In stock"
              : "Currently unavailable"}
          </p>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="font-sans text-sm font-bold uppercase tracking-wide">
              Qty
            </span>
            <div className="inline-flex shrink-0 items-center overflow-hidden border border-line rounded-md">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="h-11 w-11 text-xl font-bold hover:bg-black hover:text-white"
              >
                &minus;
              </button>
              <span className="flex h-11 w-12 items-center justify-center border-x border-line font-mono">
                {qty}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                disabled={qty >= maxQty}
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="h-11 w-11 text-xl font-bold hover:bg-black hover:text-white disabled:text-black/25 disabled:hover:bg-transparent disabled:hover:text-black/25"
              >
                +
              </button>
            </div>
          </div>

          {product.specs && product.specs.length > 0 && (
            <section className="md:hidden">
              <h2 className="pb-1 font-sans text-sm font-bold uppercase tracking-wide">
                About this product
              </h2>
              <SpecTable rows={product.specs} />
            </section>
          )}

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

      <MobileStickyBar
        onAddToCart={handleAdd}
        onBuyNow={handleBuyNow}
        added={added}
        disabled={!product.inStock}
      />

      {/* Spacer so the fixed mobile bar never overlaps the footer/content */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
