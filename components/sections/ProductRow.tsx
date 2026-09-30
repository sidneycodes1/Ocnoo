import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import HorizontalScrollRow from "@/components/sections/HorizontalScrollRow";

interface ProductRowProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

// Carouselled product section (swipeable snap row).
export default function ProductRow({
  title,
  products,
  viewAllHref,
}: ProductRowProps) {
  return (
    <HorizontalScrollRow
      title={title}
      viewAllHref={viewAllHref}
      items={products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    />
  );
}
