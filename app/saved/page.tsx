"use client";

import { useSaved } from "@/context/SavedContext";
import EmptyState from "@/components/pages/EmptyState";
import ProductList from "@/components/product/ProductList";
import ProductGrid from "@/components/product/ProductGrid";
import { BookmarkIcon } from "@/components/ui/icons";

export default function SavedPage() {
  const { products, hydrated, count } = useSaved();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center font-sans">
        Loading your saved items…
      </div>
    );
  }

  if (count === 0) {
    return (
      <EmptyState
        icon={<BookmarkIcon size={40} />}
        title="My Saved"
        description="Tap the heart on any product to keep it here."
        action={{ label: "Find anything", href: "/shop" }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 font-sans text-3xl font-extrabold uppercase tracking-tight sr-only md:not-sr-only">
        Saved
      </h1>
      {/* axe: the cards and rows below title themselves with <h3>, so without an
          <h2> between them and the <h1> the outline skips a level. */}
      <h2 className="sr-only">Saved products</h2>
      <p className="mb-4 font-sans text-sm text-black/70">
        {count} {count === 1 ? "item" : "items"} saved on this device.
      </p>
      {/* The rows carry the toggle on mobile and the cards carry it on desktop;
          without one of each, a saved item could never be un-saved here. */}
      <ProductList products={products} className="md:hidden" showSave />
      <ProductGrid products={products} className="hidden md:grid" />
    </div>
  );
}
