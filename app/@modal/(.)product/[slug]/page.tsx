import { notFound } from "next/navigation";
import { getProductBySlug } from "@/data/products";
import ProductSheet from "@/components/product/ProductSheet";

interface Props {
  params: { slug: string };
}

/**
 * Intercepted view of a product: `(.)product/[slug]` catches in-app navigations
 * to /product/[slug] and renders them here instead, over the page the user was
 * already on. Direct loads (shared link, reload, new tab) do not match this
 * route - they render app/product/[slug]/page.tsx as a full page, so the URL
 * keeps working on its own.
 */
export default function ProductModalPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductSheet product={product} />;
}
