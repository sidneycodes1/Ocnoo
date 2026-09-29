import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/data/categories";
import ShopBrowser from "@/components/product/ShopBrowser";

interface Props {
  params: { category: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const cat = getCategoryBySlug(params.category);
  return {
    title: cat ? `${cat.name} — OCNOO` : "Category — OCNOO",
  };
}

export default function ShopCategoryPage({ params }: Props) {
  const cat = getCategoryBySlug(params.category);
  if (!cat) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-sans text-3xl font-extrabold uppercase tracking-tight">
        {cat.name}
      </h1>
      <ShopBrowser initialCategory={cat.slug} />
    </div>
  );
}
