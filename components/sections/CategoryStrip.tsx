import Link from "next/link";
import { categories } from "@/data/categories";
import SectionHeader from "@/components/ui/SectionHeader";
import { CategoryIcon, PlusIcon } from "@/components/ui/icons";

// Mobile-only icon strip (the desktop home keeps the existing card row).
// Four categories plus a "See More" slot so the row always fills 5 columns.
export default function CategoryStrip() {
  const shown = categories.slice(0, 4);

  return (
    <section className="mb-8">
      <SectionHeader title="Shop by Category" moreHref="/shop" />
      <ul className="grid grid-cols-5 gap-1">
        {shown.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/shop/${cat.slug}`}
              className="flex min-h-[44px] flex-col items-center gap-2 py-2 active:bg-page"
            >
              <span className="text-primary">
                <CategoryIcon name={cat.icon} size={26} />
              </span>
              <span className="line-clamp-2 text-center font-sans text-[10px] font-semibold leading-tight">
                {cat.name}
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/shop"
            className="flex min-h-[44px] flex-col items-center gap-2 py-2 active:bg-page"
          >
            <span className="text-primary">
              <PlusIcon size={26} />
            </span>
            <span className="text-center font-sans text-[10px] font-semibold leading-tight">
              See More
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
