import Link from "next/link";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

// Featured = first 8 products in the dataset.
const FEATURED = products.slice(0, 8);

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 py-8 md:py-12">
      {/* Hero */}
      <section className="mb-12 border-2 border-black bg-white shadow-hard">
        <div className="px-6 py-14 text-center md:px-12 md:py-20">
          <h1 className="mx-auto max-w-3xl font-sans text-3xl font-extrabold uppercase leading-tight md:text-5xl">
            Quality Products. Great Prices. Delivered to You.
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-sans text-base md:text-lg">
            Shop electronics, home essentials, fashion and more from OCNOO —
            Buy • Sell • Resell.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="/shop" variant="primary">
              Shop Now
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="mb-4 font-sans text-2xl font-bold uppercase tracking-tight">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop/${cat.slug}`} className="h-full">
              <Card className="flex h-full items-center justify-center p-4 text-center">
                <span className="font-sans text-sm font-bold uppercase tracking-wide">
                  {cat.name}
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section>
        <h2 className="mb-4 font-sans text-2xl font-bold uppercase tracking-tight">
          Featured Products
        </h2>
        <ProductGrid products={FEATURED} />
      </section>
    </div>
  );
}
