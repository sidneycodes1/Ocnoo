"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

interface HorizontalScrollRowProps {
  id?: string;
  title: string;
  viewAllHref?: string;
  items: ReactNode[];
  itemClassName?: string;
}

// Swipeable snap row on mobile; on md+ the items keep the same widths the
// regular grid uses (4-up at lg), so the row fits and never overflows.
export default function HorizontalScrollRow({
  id,
  title,
  viewAllHref,
  items,
  itemClassName = "w-[43%] md:w-[30%] lg:w-[23%]",
}: HorizontalScrollRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: 1 | -1) {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-sans text-2xl font-bold uppercase tracking-tight">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {/* Scroll nudges (useful on touchless desktops when the row overflows) */}
          <div className="hidden md:flex md:gap-2">
            <Button
              type="button"
              variant="secondary"
              aria-label={`Scroll ${title} left`}
              onClick={() => scrollBy(-1)}
              className="h-9 w-9 !min-h-0 !p-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Button>
            <Button
              type="button"
              variant="secondary"
              aria-label={`Scroll ${title} right`}
              onClick={() => scrollBy(1)}
              className="h-9 w-9 !min-h-0 !p-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Button>
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="font-sans text-xs font-bold uppercase tracking-wide hover:underline hover:underline-offset-4"
            >
              View all
            </Link>
          )}
        </div>
      </div>
      <div
        ref={rowRef}
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
