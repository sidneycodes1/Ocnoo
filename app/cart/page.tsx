"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatNaira } from "@/lib/utils";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import PriceTag from "@/components/ui/PriceTag";
import ProductListRow from "@/components/product/ProductListRow";
import { TrashIcon } from "@/components/ui/icons";

/**
 * Up to 20 choices, but never more than the line can actually be: the list is
 * capped by real stock when the row declares it, and floored at the quantity
 * already in the cart so the current value is always selectable.
 */
function qtyOptions(current: number, stock?: number): string[] {
  const cap = stock === undefined ? 20 : Math.min(stock, 20);
  const top = Math.max(current, cap);
  return Array.from({ length: top }, (_, i) => String(i + 1));
}

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem, hydrated } = useCart();
  // Which row has its delete panel revealed. Only one at a time.
  const [openId, setOpenId] = useState<string | null>(null);

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
      <h1 className="mb-6 font-sans text-3xl font-extrabold uppercase tracking-tight sr-only md:not-sr-only">
        Your Cart
      </h1>

      {/* ---- MOBILE: reference rows with reveal-to-delete ---------------- */}
      {/* Each row titles itself with <h3>. This block only renders below md, so
          the heading is screen-reader-only and is hidden at md+ together with
          the rows it heads - it must not sit in the desktop outline. */}
      <h2 className="sr-only md:hidden">Items in your cart</h2>
      <ul className="-mx-4 border-y border-line bg-white md:hidden">
        {lines.map(({ product, quantity, lineTotal }) => {
          const open = openId === product.id;
          return (
            <li
              key={product.id}
              className="relative overflow-hidden border-b border-line last:border-b-0"
            >
              {/* The destructive layer sits underneath the row content. It is
                  deliberately square — the only non-rounded surface in the
                  mobile shell. */}
              <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center bg-danger">
                <button
                  type="button"
                  aria-label={`Confirm remove ${product.name} from cart`}
                  onClick={() => {
                    removeItem(product.id);
                    setOpenId(null);
                  }}
                  className="flex h-full w-full items-center justify-center text-white"
                >
                  <TrashIcon size={24} />
                </button>
              </div>

              <div
                className={
                  "relative bg-white transition-transform duration-200 " +
                  (open ? "-translate-x-24" : "translate-x-0")
                }
              >
                <ProductListRow
                  product={product}
                  divider={false}
                  trailing={<PriceTag price={lineTotal} tone="shell" size="sm" />}
                />
                <div className="flex items-center justify-between gap-3 px-3 pb-3">
                  <label className="flex items-center gap-2 font-sans text-xs uppercase tracking-wide text-black/50">
                    Qty
                    <Select
                      fullWidth={false}
                      placeholder={null}
                      aria-label={`Quantity of ${product.name}`}
                      options={qtyOptions(quantity, product.stockQty)}
                      value={String(quantity)}
                      className="min-h-[44px] w-auto py-1 text-sm"
                      onChange={(e) =>
                        updateQuantity(product.id, Number(e.target.value))
                      }
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : product.id)}
                    className="inline-flex min-h-[44px] items-center px-2 font-sans text-xs font-bold uppercase tracking-wide underline underline-offset-4"
                  >
                    {open ? "Cancel" : "Remove"}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 md:hidden">
        <div className="flex items-center justify-between font-sans text-base">
          <span>Subtotal</span>
          <PriceTag price={subtotal} tone="shell" />
        </div>
        <p className="mt-2 font-sans text-xs leading-relaxed text-black/50">
          Delivery is confirmed at checkout once you enter your state, and is
          shown before you pay.
        </p>
        {/* Full-width stack: at 320px two side-by-side pills wrapped their
            labels onto a second line. This block is mobile-only (md:hidden). */}
        <div className="mt-4 flex flex-col gap-3">
          <Button href="/shop" variant="secondary" shape="pill" labelCase="none" className="w-full">
            Continue Shopping
          </Button>
          <Button href="/checkout" variant="primary" shape="pill" tone="primary" labelCase="none" className="w-full">
            Checkout
          </Button>
        </div>
      </div>

      {/* ---- DESKTOP: unchanged from before the mobile shell -------------- */}
      <ul className="hidden animate-fade-in flex-col gap-4 md:flex">
        {lines.map(({ product, quantity, lineTotal }) => (
          <li key={product.id}>
            <Card className="p-3">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Thumbnail (placeholder frame) */}
                <Link
                  href={`/product/${product.slug}`}
                  className="flex h-20 w-20 shrink-0 items-center justify-center border border-line rounded-lg"
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
                    className="flex min-h-[44px] items-center truncate font-sans text-sm font-bold uppercase hover:underline hover:underline-offset-4"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 font-mono text-sm">
                    {formatNaira(product.price)}
                  </p>
                </div>

                <p className="shrink-0 font-mono text-base">{formatNaira(lineTotal)}</p>
              </div>

              {/* Quantity/remove controls span the full card width. Nested inside
                  the text column they collided with the line total at 320px: the
                  44px stepper is a fixed 130px and cannot shrink to a 98px column. */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="inline-flex shrink-0 items-center overflow-hidden border border-line rounded-md">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="h-11 w-11 shrink-0 text-lg font-bold hover:bg-black hover:text-white"
                  >
                    &minus;
                  </button>
                  <span className="flex h-11 w-10 shrink-0 items-center justify-center border-x border-line font-mono text-sm">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="h-11 w-11 shrink-0 text-lg font-bold hover:bg-black hover:text-white"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(product.id)}
                  className="inline-flex min-h-[44px] items-center px-1 font-sans text-xs font-bold uppercase tracking-wide underline underline-offset-4 hover:bg-black hover:text-white"
                >
                  Remove
                </button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <div className="mt-8 hidden flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:flex">
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
