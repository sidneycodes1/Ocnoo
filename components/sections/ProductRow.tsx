import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";
import HorizontalScrollRow from "@/components/sections/HorizontalScrollRow";

interface ProductRowProps {
  title: string;
  products: Product[];
}

// Carouselled product section (swipeable snap row).
export default function ProductRow({ title, products }: ProductRowProps) {
  return (
    <HorizontalScrollRow
      title={title}
      items={products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    />
  );
}
