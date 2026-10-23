import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";

interface SectionHeaderProps {
  title: string;
  /**
   * Destination for the trailing "More" link. Every section on the home page is
   * a slice of a longer collection, so this is how a wall that has run out of
   * tiles is left - there is no expander and no carousel to nudge.
   */
  moreHref?: string;
}

// `Title …………… More >` row used by every horizontal section.
export default function SectionHeader({
  title,
  moreHref,
}: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="font-sans text-2xl font-bold uppercase tracking-tight">
        {title}
      </h2>
      {moreHref && (
        <Link
          href={moreHref}
          className="inline-flex min-h-[44px] items-center gap-0.5 font-sans text-sm text-black/70 transition-colors hover:text-black"
        >
          More
          <ChevronRightIcon size={16} />
        </Link>
      )}
    </div>
  );
}
