import Link from "next/link";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import ProductRow from "@/components/sections/ProductRow";
import HorizontalScrollRow from "@/components/sections/HorizontalScrollRow";
import Card from "@/components/ui/Card";

// Carouselled home sections draw from the front of the dataset; "Just In"
// shows the next slice so the two rows don't repeat the same items.
const POPULAR = products.slice(0, 8);
const JUST_IN = products.slice(8, 16);

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 py-8 md:py-12">
      {/* Categories — swipeable pill row on mobile, wraps on larger screens */}
      <HorizontalScrollRow
        title="Shop by Category"
        viewAllHref="/shop"
        itemClassName="w-[60%] sm:w-[38%] md:w-[30%] lg:w-[23%]"
        items={categories.map((cat) => (
          <Link key={cat.id} href={`/shop/${cat.slug}`} className="block h-full">
            <Card className="flex h-full min-h-[72px] items-center justify-center p-4 text-center">
              <span className="font-sans text-sm font-bold uppercase tracking-wide">
                {cat.name}
              </span>
            </Card>
          </Link>
        ))}
      />

      {/* Product carousels */}
      <ProductRow title="Popular Right Now" products={POPULAR} viewAllHref="/shop" />
      <ProductRow title="Just In" products={JUST_IN} viewAllHref="/shop" />
    </div>
  );
}
