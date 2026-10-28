"use client";

import { useEffect, useState } from "react";

export interface ContentsItem {
  id: string;
  label: string;
}

interface PolicyContentsProps {
  items: ContentsItem[];
  /**
   * `rail` is the sticky desktop column, `disclosure` the collapsed list above
   * the content on small screens. They render the same links, so the marking
   * logic lives in one place.
   */
  variant: "rail" | "disclosure";
}

/**
 * Section index for a policy page, with the current section marked as you scroll.
 *
 * The active item is signalled by a 2px ink bar *and* weight, never by colour
 * alone, so it survives high-contrast mode and colour-blind users. The
 * `aria-current="location"` attribute is what assistive tech reads.
 *
 * The "have I passed this heading yet" line is read off each section's own
 * computed `scroll-margin-top` — the same value the browser uses when it lands
 * an anchor jump, which globals.css derives from `--header-stack`. Deriving it
 * from anywhere else drifts: an earlier version used the header height plus a
 * different allowance and marked the section *before* the one you jumped to.
 */
export default function PolicyContents({ items, variant }: PolicyContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const spy = () => {
      frame = 0;
      let line = 0;
      let current: string | null = null;
      // Sections appear in document order, so the last one already above the
      // line is the one being read. Before the first heading is reached nothing
      // is marked.
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (!el) continue;
        if (!line) {
          line = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
        }
        // The 0.5px slack absorbs sub-pixel rounding between the landing
        // position and this read.
        if (el.getBoundingClientRect().top - line <= 0.5) current = item.id;
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
    <nav aria-label={variant === "rail" ? "Sections in this document" : undefined}>
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-black/45">
        {variant === "rail" ? "In this article" : "Jump to a section"}
      </p>
      <ul
        className={
          variant === "rail"
            ? "mt-3 flex flex-col gap-1"
            : "mt-2 grid gap-1 sm:grid-cols-2"
        }
      >
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active ? "location" : undefined}
                className={`block border-l-2 pl-3 font-sans text-sm leading-snug transition-colors ${
                  // The desktop list is pointer-only and can sit tight; the
                  // collapsed list is what a thumb taps on a phone, so its rows
                  // are padded to the 44px target the rest of the app uses.
                  variant === "rail" ? "py-1" : "py-3"
                } ${
                  active
                    ? "border-black font-extrabold text-black"
                    : "border-line/70 text-black/55 hover:border-black/40 hover:text-black"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
