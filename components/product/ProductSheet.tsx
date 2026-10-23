"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Product } from "@/types";
import ProductDetail from "@/components/product/ProductDetail";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The product sheet: the same ProductDetail the /product/[slug] route renders,
 * opened over the grid instead of replacing it.
 *
 * It reaches here through a Next.js intercepting route (`app/@modal/(.)product/
 * [slug]`), which only fires for in-app navigations. That distinction is the
 * whole point: a tap on a card slides this up over the list, while a shared
 * link, a paste into a new tab or a browser reload still gets the real
 * /product/[slug] page with a URL that stands on its own.
 */
export default function ProductSheet({ product }: { product: Product }) {
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const slug = product.slug;

  // A `@modal` slot keeps whatever it rendered across client-side navigation,
  // so pushing /checkout from inside the sheet leaves the sheet mounted with the
  // body still locked. The slot's own visibility therefore follows the URL: when
  // the route stops being a product, the sheet renders nothing and releases the
  // scroll lock through the effect cleanup below.
  const open = pathname.startsWith("/product/");

  const close = useCallback(() => {
    // back() unwinds the intercepted push, so the grid underneath is still
    // mounted and keeps its scroll position. Without history there is nothing to
    // unwind, so fall forward to the full page the URL already names.
    if (window.history.length > 1) router.back();
    else router.replace(`/product/${slug}`);
  }, [router, slug]);

  // Desktop never sees a sheet: the overlay is `md:hidden`, so an intercepted
  // navigation there left the grid on screen under a product URL with nothing
  // over it, and the body still scroll-locked.
  //
  // `router.replace(/product/<slug>)` cannot fix that - the intercept already
  // pushed that exact URL, so replacing it with itself is a no-op and the
  // `@modal` slot keeps rendering the sheet. A document navigation is the only
  // thing that renders the page the URL actually names, and a non-intercepted
  // load can never re-mount this sheet, so it cannot loop.
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      window.location.assign(`/product/${slug}`);
    }
  }, [slug]);

  useEffect(() => {
    if (!open) return;
    const doc = window.document;
    const body = doc.body;
    const previousOverflow = body.style.overflow;
    const opener = doc.activeElement as HTMLElement | null;

    // The page behind must not scroll while a modal owns the viewport, or a
    // wheel over the backdrop moves content the user cannot see.
    body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      // Keep the tab ring inside the panel; the backdrop button deliberately
      // isn't part of it, so a keyboard user can't reach the layer behind.
      if (e.shiftKey && doc.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && doc.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    doc.addEventListener("keydown", onKeyDown);
    return () => {
      doc.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      // Return focus to the card that opened the sheet rather than dumping it on
      // the document body, which would restart the tab order for keyboard users.
      opener?.focus?.();
    };
  }, [close, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      {/* Backdrop is a button so a tap and an Enter both dismiss it. */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close product"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-black/40 motion-safe:animate-fade-in"
      />

      <div
        ref={panelRef}
        className="absolute inset-x-0 bottom-0 max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-line bg-white animate-sheet-up"
      >
        <div className="sticky top-0 z-10 flex h-8 items-center justify-center bg-white">
          <span
            aria-hidden="true"
            className="h-1.5 w-10 rounded-full bg-disabled"
          />
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close product"
            className="absolute right-1 top-0 flex h-11 w-11 items-center justify-center rounded-full text-2xl leading-none text-black/55 active:bg-page"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <ProductDetail product={product} />
      </div>
    </div>
  );
}
