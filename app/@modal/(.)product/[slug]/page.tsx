import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog";
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
export default async function ProductModalPage({ params }: Props) {
  // An unpublished product 404s here too: the intercepted route reads the same
  // catalogue as the full page, so hiding a product in the admin closes both.
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  return <ProductSheet product={product} />;
}
