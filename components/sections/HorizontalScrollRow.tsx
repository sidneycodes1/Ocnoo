import { type ReactNode } from "react";
import SectionHeader from "@/components/ui/SectionHeader";

interface HorizontalScrollRowProps {
  id?: string;
  title: string;
  items: ReactNode[];
  itemClassName?: string;
  /** Optional destination for the "More" link. */
  moreHref?: string;
}

/**
 * Swipeable snap row on mobile; on md+ the items keep the same widths the
 * regular grid uses (4-up at lg), so the row fits and never overflows.
 *
 * The `‹ ›` nudges that used to sit in the heading are gone: the home page no
 * longer has any row that needs them, and on the rows that do scroll, every
 * item is a link, so Tab reaches the off-screen ones and the browser scrolls
 * them into view. A pointer user can wheel or drag. Nothing is stranded.
 */
export default function HorizontalScrollRow({
  id,
  title,
  items,
  itemClassName = "w-[43%] md:w-[30%] lg:w-[23%]",
  moreHref,
}: HorizontalScrollRowProps) {
  return (
    <section className="mb-12">
      <SectionHeader title={title} moreHref={moreHref} />
      <div
        id={id}
        role="region"
        aria-label={title}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
      >
        {items.map((item, i) => (
          <div
            key={i}
            className={`shrink-0 snap-start ${itemClassName}`}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
