import Link from "next/link";
import { categories } from "@/data/categories";
import { COLLECTION_META } from "@/data/collectionMeta";
import { getPublishedProducts, resolveCollection } from "@/lib/catalog";
import ProductWall from "@/components/sections/ProductWall";
import CategoryStrip from "@/components/sections/CategoryStrip";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";

// Every home row and the page behind its "More >" link come out of
// COLLECTION_META, so the two can never drift apart into different products.
const collectionHref = (key: string) => `/collections/${key}`;

/**
 * Desktop categories: a full 4 x 2 grid.
 *
 * Seven categories into four columns is 4 + 3, which strands an empty cell at
 * the end of the second row, so the eighth slot is a real destination - "All
 * Categories" opens /shop, the same page the heading's "More" opens. That keeps
 * every cell the same size and means nothing overflows, which is why this grid
 * has no scroll nudges: there is nothing to scroll to.
 *
 * The gutter is 16px, the same measure the product walls below it use, so the
 * page has one spacing unit rather than a 12px row sitting above 16px columns.
 */
function CategoryGrid() {
  return (
    <section aria-label="Shop by Category">
      <SectionHeader title="Shop by Category" moreHref="/shop" />
      <ul className="grid grid-cols-4 gap-4">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Link href={`/shop/${cat.slug}`} className="block h-full">
              <Card className="flex h-full min-h-[72px] items-center justify-center p-4 text-center">
                <span className="font-sans text-sm font-bold uppercase tracking-wide">
                  {cat.name}
                </span>
              </Card>
            </Link>
          </li>
        ))}
        <li>
          <Link href="/shop" className="block h-full">
            <Card className="flex h-full min-h-[72px] items-center justify-center p-4 text-center">
              <span className="font-sans text-sm font-bold uppercase tracking-wide">
                All Categories
              </span>
            </Card>
          </Link>
        </li>
      </ul>
    </section>
  );
}

export default async function HomePage() {
  // One read of the shared catalogue; every row below is a different ordering
  // of the same list, so a product published in the admin appears wherever it
  // ranks without a redeploy.
  const products = await getPublishedProducts();
  const collections = COLLECTION_META.map((meta) => resolveCollection(products, meta));
  const popular = collections.find((collection) => collection.key === "popular-right-now");
  const justIn = collections.find((collection) => collection.key === "just-in");

  return (
    <div className="mx-auto max-w-6xl animate-fade-in px-4 py-8 md:py-12">
      {/* The hero block was removed, so the page keeps a screen-reader-only h1
          to remain the document heading for accessibility and SEO. */}
      <h1 className="sr-only">OCNOO Online Store — Buy, Sell and Resell</h1>

      {/* Mobile: the icon strip, then every collection as a two-column
          waterfall. Each keeps the title row it had as a swipe row. */}
      <div className="md:hidden">
        <CategoryStrip />
        <div className="flex flex-col gap-8">
          {collections.map((collection) => (
            <ProductWall
              key={collection.key}
              title={collection.title}
              products={collection.home}
              moreHref={collectionHref(collection.key)}
            />
          ))}
        </div>
      </div>

      {/* Desktop: the same waterfall sections, laid out 3-4 columns wide with
          16px gutters. They replace the swipe rows, so a section that runs out
          of tiles ends - and "More >" is how you leave it. */}
      <div className="hidden md:block">
        <div className="flex flex-col gap-12">
          <CategoryGrid />
          {popular && (
            <ProductWall
              title={popular.title}
              products={popular.home}
              moreHref={collectionHref(popular.key)}
              wall="desktop"
            />
          )}
          {justIn && (
            <ProductWall
              title={justIn.title}
              products={justIn.home}
              moreHref={collectionHref(justIn.key)}
              wall="desktop"
            />
          )}
        </div>
      </div>
    </div>
  );
}
