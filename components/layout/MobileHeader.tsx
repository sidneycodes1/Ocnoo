"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { parentOf, resolveScreen } from "@/lib/nav";
import { SORT_OPTIONS, isSortKey } from "@/lib/sort";
import SearchPill from "@/components/forms/SearchPill";
import {
  ArrowLeftIcon,
  CartIcon,
  SortIcon,
} from "@/components/ui/icons";

/* ---- Sort -------------------------------------------------------------- */

// A real control, not a decorative one: each option navigates with ?sort= set,
// which ShopBrowser applies. Rendered as <details> so it works without any
// extra click-outside state.
function SortMenu() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "relevance";

  function hrefFor(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "relevance") params.delete("sort");
    else params.set("sort", key);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <details className="relative">
      <summary
        className="flex h-11 w-11 list-none items-center justify-center text-black [&::-webkit-details-marker]:hidden"
        aria-label="Sort results"
      >
        <SortIcon size={22} />
      </summary>
      <ul className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-soft-hover">
        {SORT_OPTIONS.map((opt) => (
          <li key={opt.key}>
            <Link
              href={hrefFor(opt.key)}
              className={`flex min-h-[44px] items-center justify-between px-4 font-sans text-sm ${
                isSortKey(opt.key) && current === opt.key
                  ? "font-bold text-primary"
                  : "text-black"
              }`}
            >
              {opt.label}
              {current === opt.key && <span aria-hidden="true">✓</span>}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}

/* ---- Cart -------------------------------------------------------------- */

/**
 * Sort only where sorting acts on something. `/shop` with no `q`/`brand` is the
 * category list, and ordering seven category rows by price is meaningless - a
 * control that does nothing is worse than no control. The moment the same route
 * is showing results, the menu returns.
 */
function SortGate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scoped =
    (searchParams.get("q") ?? "").trim().length > 0 ||
    (searchParams.get("brand") ?? "").trim().length > 0 ||
    searchParams.get("view") === "all";
  if (pathname === "/shop" && !scoped) return null;
  return <SortMenu />;
}

function CartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
      className="relative flex h-11 w-11 shrink-0 items-center justify-center text-black"
    >
      <CartIcon size={22} />
      {count > 0 && (
        <span className="absolute right-0 top-0 flex h-5 min-w-[20px] items-center justify-center rounded-md bg-primary px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

/* ---- Header ------------------------------------------------------------ */

export default function MobileHeader() {
  const pathname = usePathname();
  const screen = resolveScreen(pathname);

  if (screen.layout === "search") {
    // One row, like the reference bar: wordmark, search, cart. The brand row
    // with the "Buy • Sell • Resell" tagline used to sit above this and pushed
    // the header to 92px with the tagline stranded on the right edge.
    return (
      <header className="sticky top-0 z-50 border-b border-line bg-white md:hidden">
        <div className="flex items-center gap-3 px-4 py-2">
          <span className="shrink-0 font-sans text-lg font-extrabold uppercase leading-none tracking-tight">
            OCNOO
          </span>
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="min-h-[44px] flex-1 rounded-full border border-line bg-surface"
              />
            }
          >
            <SearchPill submitTo={pathname} className="flex-1" />
          </Suspense>
          <CartButton />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white md:hidden">
      <div className="flex min-h-[56px] items-center gap-1 px-1">
        <div className="flex w-11 shrink-0 justify-start">
          {screen.back && (
            <Link
              href={parentOf(pathname)}
              aria-label="Back"
              className="flex h-11 w-11 items-center justify-center text-black"
            >
              <ArrowLeftIcon size={22} />
            </Link>
          )}
        </div>
        {/* Visual chrome only. Each route keeps its own real <h1> (sr-only on
            mobile where the header repeats it), so the document still has
            exactly one accessible heading. */}
        <span
          aria-hidden="true"
          className="min-w-0 flex-1 truncate text-center font-sans text-base font-bold"
        >
          {screen.title}
        </span>
        <div className="flex shrink-0 items-center justify-end">
          {screen.sort && (
            <Suspense fallback={<div className="h-11 w-11" />}>
              <SortGate />
            </Suspense>
          )}
          <CartButton />
        </div>
      </div>
    </header>
  );
}
