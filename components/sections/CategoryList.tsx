import Link from "next/link";
import { categories } from "@/data/categories";
import { countByCategory } from "@/lib/catalog";
import type { Product } from "@/types";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { ChevronRightIcon } from "@/components/ui/icons";

function itemLabel(count: number): string {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

/**
 * The Categories screen list (mobile). Row shape is inherited from ProductList:
 * full-bleed white with hairline dividers, pulling out of the page gutter with
 * -mx-4 and putting the 16px back as px-4 so the text still lines up with every
 * other block on the page.
 *
 * "All Products" is the first row because the bare /shop route now lists
 * categories - the whole catalogue needs an explicit entry, and `?view=all` is
 * how the page tells the two apart.
 *
 * The counts come from the published catalogue passed in, so a category with
 * nothing published reads "0 items" instead of advertising stock the admin
 * has already hidden.
 */
export default function CategoryList({ products }: { products: Product[] }) {
  const counts = countByCategory(products);

  const rows = [
    { key: "all", name: "All Products", href: "/shop?view=all", count: products.length },
    ...categories.map((cat) => ({
      key: cat.id,
      name: cat.name,
      href: `/shop/${cat.slug}`,
      count: counts[cat.slug] ?? 0,
    })),
  ];

  return (
    <ul className="-mx-4 border-y border-line bg-white">
      {rows.map((row, i) => (
        <li key={row.key}>
          <Link
            href={row.href}
            className={`flex min-h-[64px] items-center gap-3 bg-white px-4 py-2 active:bg-page ${
              i < rows.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <PlaceholderImage
              iconSize={22}
              className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-sans text-[15px] font-semibold leading-tight">
                {row.name}
              </span>
              <span className="mt-0.5 block font-sans text-xs text-black/50">
                {itemLabel(row.count)}
              </span>
            </span>
            <ChevronRightIcon size={18} className="shrink-0 text-black/40" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
