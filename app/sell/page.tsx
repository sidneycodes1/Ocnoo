"use client";

import ListingForm from "@/components/sell/ListingForm";
import { useListings } from "@/context/ListingsContext";

/**
 * Post an ad. Everything stays on this device: the words in localStorage, the
 * photos in IndexedDB. There is no server in this build, so "post" means it
 * appears in My ads and in your own row on /shop.
 *
 * The browser-only disclaimer and the "My ads" / "Sell at scale" shortcuts used
 * to sit under the form; they were removed at the user's request, so this screen
 * is the heading and the composer only. Neither destination is stranded - saving
 * an ad lands on /my-ads, so does Cancel, and both routes keep links in the
 * header Menu, the account rail and the footer.
 */
export default function SellPage() {
  const { hydrated } = useListings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 md:py-8">
      <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only md:mb-4">
        Post an Ad
      </h1>

      {!hydrated ? (
        <div
          aria-hidden="true"
          className="flex flex-col gap-4"
        >
          <div className="min-h-[160px] rounded-md border border-line bg-surface" />
          <div className="h-11 rounded-md bg-surface" />
          <div className="h-11 rounded-md bg-surface" />
        </div>
      ) : (
        <ListingForm />
      )}
    </div>
  );
}
