import { products } from "@/data/products";
import ProductGrid from "@/components/product/ProductGrid";

// Category filtering is driven purely by the route (/shop/<slug>); the
// in-page chip filter bar was removed, so no client state is needed here.
export default function ShopBrowser({
  initialCategory = "all",
}: {
  initialCategory?: string;
}) {
  const visible =
    initialCategory === "all"
      ? products
      : products.filter((p) => p.category === initialCategory);

  return <ProductGrid products={visible} />;
}
