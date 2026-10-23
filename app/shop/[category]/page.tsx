import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/data/categories";
import ShopBrowser from "@/components/product/ShopBrowser";
import { isSortKey } from "@/lib/sort";

interface Props {
  params: { category: string };
  searchParams: { q?: string; sort?: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const cat = getCategoryBySlug(params.category);
  return {
    title: cat ? `${cat.name} — OCNOO` : "Category — OCNOO",
  };
}

export default function ShopCategoryPage({ params, searchParams }: Props) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) notFound();

  const q = (searchParams.q ?? "").trim();
  const sort = isSortKey(searchParams.sort) ? searchParams.sort : "relevance";

  return (
    // Mobile runs 12px under the screen header instead of the old 32px - with
    // only a handful of items per category, the gap read as an empty page. The
    // heading is sr-only below md, so its margin costs nothing there.
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-3 md:py-8">
      {/* The mobile screen header already shows the category name, so the
          heading is announced but not repeated visually below md. */}
      <h1 className="mb-6 font-sans text-3xl font-extrabold uppercase tracking-tight sr-only md:not-sr-only">
        {cat.name}
      </h1>
      {/* The result cards title themselves with <h3>; this keeps the outline at
          h1 -> h2 -> h3 instead of skipping a level. */}
      <h2 className="sr-only">Products in {cat.name}</h2>
      <ShopBrowser initialCategory={cat.slug} query={q} sort={sort} />
    </div>
  );
}
