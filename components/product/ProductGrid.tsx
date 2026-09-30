import type { Product } from "@/types";
import ProductCard from "@/components/product/ProductCard";

export default function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="bg-surface rounded-xl shadow-soft p-6 text-center font-sans">
        No products found in this category yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 animate-fade-in md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
