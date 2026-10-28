"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export interface SectionTab {
  id: string;
  label: string;
  icon: ReactNode;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25";

/**
 * The right rail's section index — the reference's "Product details /
 * Specifications" card.
 *
 * It marks the section being read using the same mechanism as the policy
 * pages' contents index (see PolicyContents): the "have I passed this heading
 * yet" line is read off each target's own computed `scroll-margin-top`, which
 * globals.css derives from `--header-stack`. An earlier draft of this component
 * was going to use an IntersectionObserver with its own hardcoded root margin,
 * which would have been a second source of truth for the header height — the
 * thing that already drifted once when the nav row came out of the header.
 *
 * Plain anchors, so the jump itself is the browser's `scroll-behavior: smooth`
 * rather than a scripted scroll.
 */
export default function SectionTabs({ items }: { items: SectionTab[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const spy = () => {
      frame = 0;
      let line = 0;
      let current: string | null = null;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (!line) {
          line = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        }
        // 4px of slack, not the 0.5px the policy index uses. An anchor jump
        // lands the heading almost exactly ON the spy line, and at half a pixel
        // the rounding either way decided whether the tab you had just clicked
        // became the active one. Two sections, both hundreds of pixels tall — a
        // 4px band marks nothing it could plausibly get wrong.
        if (el.getBoundingClientRect().top - line <= 4) current = item.id;
        else break;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(spy);
    };

    spy();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav
      aria-label="Sections of this listing"
      className="overflow-hidden rounded-xl border border-line bg-white p-1"
    >
      <ul>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "true" : undefined}
                className={`flex min-h-[44px] items-center gap-2.5 rounded-lg px-3 font-sans text-sm font-bold transition-colors ${
                  active
                    ? "bg-surface text-black"
                    : "text-black/70 hover:bg-surface/70 hover:text-black"
                } ${FOCUS_RING}`}
              >
                {/* The icon is decoration next to a text label, so it is hidden
                    from assistive tech; the active state is carried by the fill
                    AND the weight, never by colour alone. */}
                <span aria-hidden="true" className="shrink-0 text-black/60">
                  {item.icon}
                </span>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
