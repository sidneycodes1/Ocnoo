import type { Product } from "@/types";
import ProductListRow from "@/components/product/ProductListRow";

interface ProductListProps {
  products: Product[];
  className?: string;
  /** Give every row a save toggle. See ProductListRow. */
  showSave?: boolean;
}

// Dense result rows. Pulls edge-to-edge out of the page gutter on mobile
// (-mx-4) and stops doing that at md, where this list is not rendered at all.
export default function ProductList({
  products,
  className = "",
  showSave = false,
}: ProductListProps) {
  return (
    <ul
      className={`-mx-4 animate-fade-in border-y border-line bg-white md:mx-0 ${className}`}
    >
      {products.map((product, i) => (
        <li key={product.id}>
          <ProductListRow
            product={product}
            divider={i < products.length - 1}
            showSave={showSave}
          />
        </li>
      ))}
    </ul>
  );
}
