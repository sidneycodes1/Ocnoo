"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem, hydrated } = useCart();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center font-sans">
        Loading your cart…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <h1 className="font-sans text-2xl font-extrabold uppercase">
            Your cart is empty
          </h1>
          <p className="font-sans">
            Browse the shop and add a few things you love.
          </p>
          <Button href="/shop" variant="primary">
            Shop Now
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 font-sans text-3xl font-extrabold uppercase tracking-tight">
        Your Cart
      </h1>

      <ul className="flex animate-fade-in flex-col gap-4">
        {lines.map(({ product, quantity, lineTotal }) => (
          <li key={product.id}>
            <Card className="p-3">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Thumbnail (placeholder frame) */}
                <Link
                  href={`/product/${product.slug}`}
                  className="flex h-20 w-20 shrink-0 items-center justify-center border-2 border-black"
                  aria-label={product.name}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="3" y="3" width="18" height="18" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${product.slug}`}
                    className="block truncate font-sans text-sm font-bold uppercase hover:underline hover:underline-offset-4"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 font-mono text-sm">
                    {formatNaira(product.price)}
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="inline-flex items-center border-2 border-black">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="h-9 w-9 text-lg font-bold hover:bg-black hover:text-white"
                      >
                        &minus;
                      </button>
                      <span className="flex h-9 w-10 items-center justify-center border-x-2 border-black font-mono text-sm">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="h-9 w-9 text-lg font-bold hover:bg-black hover:text-white"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="font-sans text-xs font-bold uppercase tracking-wide underline underline-offset-4 hover:bg-black hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <p className="shrink-0 font-mono text-base">{formatNaira(lineTotal)}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sans text-lg">
          Subtotal:{" "}
          <span className="font-mono font-bold">{formatNaira(subtotal)}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          <Button href="/shop" variant="secondary">
            Continue Shopping
          </Button>
          <Button href="/checkout" variant="primary">
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
