import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COLLECTIONS, getCollection } from "@/data/collections";
import ProductTileGrid from "@/components/product/ProductTileGrid";
import ProductGrid from "@/components/product/ProductGrid";

interface CollectionPageProps {
  params: { key: string };
}

// Three known keys, all prerendered. An unknown key falls through to notFound()
// below rather than being given a page.
export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ key: collection.key }));
}

export function generateMetadata({ params }: CollectionPageProps): Metadata {
  const collection = getCollection(params.key);
  return {
    title: collection
      ? `${collection.title} — OCNOO Online Store`
      : "Collection — OCNOO Online Store",
    description: collection?.blurb,
  };
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const collection = getCollection(params.key);
  if (!collection) notFound();

  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 pb-8 pt-3 md:py-12">
      {/* Mobile shows the title in the app-shell header, so the h1 is announced
          there and drawn from md up. */}
      <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only md:text-4xl">
        {collection.title}
      </h1>
      <p className="mt-1 font-sans text-sm text-black/60 md:mt-2">
        {collection.blurb}
      </p>
      <p className="mt-0.5 font-sans text-xs uppercase tracking-wide text-black/45">
        {collection.products.length} products
      </p>

      {/* Mobile: the same waterfall the home row used, in full. Desktop: the
          catalogue grid. The home page walls stagger and this grid does not, so
          a full collection reads as a list of equals - it is the one place the
          two shapes differ, and the "More" link crosses it. The
          wrapper carries the visibility - appending `hidden` to ProductGrid
          would fight its own base `grid` in the cascade. */}
      <h2 className="sr-only">Products in {collection.title}</h2>
      <div className="mt-4 md:hidden">
        <ProductTileGrid products={collection.products} />
      </div>
      <div className="mt-8 hidden md:block">
        <ProductGrid products={collection.products} />
      </div>
    </div>
  );
}
