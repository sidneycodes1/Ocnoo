import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ShopBrowser from "@/components/product/ShopBrowser";
import YourListings from "@/components/listing/YourListings";
import CategoryList from "@/components/sections/CategoryList";
import SearchPill from "@/components/forms/SearchPill";
import { getBrandBySlug } from "@/data/brands";
import { isSortKey } from "@/lib/sort";
import { ArrowLeftIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Categories — OCNOO Online Store",
};

interface Props {
  searchParams: { q?: string; sort?: string; brand?: string; view?: string };
}

export default function ShopPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim();
  const sortKey = isSortKey(searchParams.sort) ? searchParams.sort : "relevance";
  const brandSlug = (searchParams.brand ?? "").trim();
  const brandName = brandSlug ? getBrandBySlug(brandSlug)?.name : undefined;
  const brand = brandName ? brandSlug : undefined;
  const showAll = searchParams.view === "all";

  // Mobile shows the category list until something actually scopes the result
  // set - a search term, a brand, or the explicit "All Products" row. Desktop
  // never enters list mode; it keeps rendering the grid it always has.
  const listingCategories = !q && !brand && !showAll;

  const resultsHeading = q
    ? `Results for “${q}”`
    : brandName
    ? `${brandName} products`
    : "Shop All Products";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-3 md:py-8">
      {/* One h1 for both surfaces: the mobile header already paints the title,
          so it stays screen-reader-only below md, and each span is hidden from
          the other breakpoint so nothing announces the wrong label. */}
      <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only">
        <span className="md:hidden">
          {listingCategories ? "Categories" : resultsHeading}
        </span>
        <span className="hidden md:inline">{resultsHeading}</span>
      </h1>

      {/* Shown only by the "All Products" row: the bare route now lists
          categories, so the way back has to be explicit. */}
      {showAll && !q && !brand && (
        <Link
          href="/shop"
          className="mb-2 inline-flex min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-wide hover:underline hover:underline-offset-4 md:hidden"
        >
          <ArrowLeftIcon size={16} />
          All categories
        </Link>
      )}

      {/* The seller's own live ads, so posting one changes this page. Suppressed
          while a search or brand filter is in force — a personal row is not a
          result for "iPhone 15". Renders nothing at all until an ad is posted,
          and it reads localStorage, so it is a client island in this server page. */}
      {!q && !brand && <YourListings />}

      {/* ShopBrowser renders exactly once. When mobile is showing the category
          list, the grid is hidden below md rather than duplicated - a second
          instance would hydrate nineteen more product cards on the smallest
          device in this build, for a surface nobody there can see. */}
      <div className={listingCategories ? "hidden md:block" : undefined}>
        {/* Inside the conditional wrapper, so it disappears with the grid it
            heads rather than announcing an empty section on mobile. The result
            cards title themselves with <h3>. */}
        <h2 className="sr-only">Products</h2>
        <ShopBrowser query={q} sort={sortKey} brand={brand} />
      </div>

      {listingCategories && (
        <div className="md:hidden">
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="mb-4 min-h-[44px] w-full rounded-full border border-line bg-surface"
              />
            }
          >
            <SearchPill submitTo="/shop" className="mb-4 w-full" />
          </Suspense>
          <CategoryList />
        </div>
      )}
    </div>
  );
}
