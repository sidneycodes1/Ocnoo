import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
import ProductDetail from "@/components/product/ProductDetail";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  return {
    title: product ? `${product.name} — OCNOO` : "Product — OCNOO",
    description: product?.description.slice(0, 155),
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div>
      {/* Desktop only — the mobile screen header carries the back arrow. */}
      <div className="mx-auto hidden max-w-6xl px-4 pt-6 md:block">
        <Link
          href="/shop"
          className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide hover:underline hover:underline-offset-4"
        >
          &larr; Back to Shop
        </Link>
      </div>
      <ProductDetail product={product} />
    </div>
  );
}
