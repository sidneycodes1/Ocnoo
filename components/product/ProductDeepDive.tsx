"use client";

import { useState } from "react";
import type { ResolvedExtras } from "@/types";
import RichText from "@/components/ui/RichText";
import SpecTable from "@/components/ui/SpecTable";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25";

/** Paragraphs shown before the copy folds. Four leaves the CTA above the fold. */
const VISIBLE_PARAGRAPHS = 4;

/**
 * A white panel. Deliberately NOT the `Card` primitive: Card carries a
 * `hover:shadow-soft-hover` elevation meant for things you can act on, and a
 * reading panel that lifts under the cursor reads as a button.
 */
function Panel({
  id,
  title,
  children,
  className = "",
}: {
  /** Anchor target for the section tabs in the right rail. */
  id?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-xl border border-line bg-white p-4 md:p-6 ${className}`}
    >
      {title && (
        <h2 className="border-b border-line pb-3 font-sans text-lg font-extrabold tracking-tight md:text-xl">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-line pb-2 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-black/60">
      {children}
    </h3>
  );
}

/**
 * The long-form content: prose detail, then the specification panels.
 *
 * Both are anchored (`stack-anchor` in globals.css) so the section tabs in the
 * right rail can jump to them and the scroll-spy can mark them, without either
 * of them having to know how tall the sticky header is.
 */
export default function ProductDeepDive({
  extras,
}: {
  extras: ResolvedExtras;
}) {
  const [expanded, setExpanded] = useState(false);

  const folds = extras.paragraphs.length > VISIBLE_PARAGRAPHS;
  const shown = expanded || !folds
    ? extras.paragraphs
    : extras.paragraphs.slice(0, VISIBLE_PARAGRAPHS);

  const specRows = [
    { label: "SKU", value: extras.sku },
    ...extras.specifications,
  ];

  return (
    <div className="flex flex-col gap-4">
      <Panel id="product-details" title="Product details" className="stack-anchor">
        <div className="flex flex-col gap-4 pt-4">
          {shown.map((paragraph, i) => (
            <p key={i} className="font-sans text-base leading-relaxed">
              <RichText text={paragraph} />
            </p>
          ))}

          {folds && (
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
              className={`w-fit font-sans text-sm font-bold uppercase tracking-wide text-black underline decoration-line underline-offset-4 hover:decoration-black ${FOCUS_RING}`}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
      </Panel>

      <div id="specifications" className="stack-anchor flex flex-col gap-4">
        <h2 className="px-1 font-sans text-lg font-extrabold tracking-tight md:text-xl">
          Specifications
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {extras.keyFeatures.length > 0 && (
            <Panel>
              <PanelHeading>Key features</PanelHeading>
              <ul className="flex flex-col gap-4 pt-4">
                {extras.keyFeatures.map((feature) => (
                  <li key={feature.title} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <div>
                      <p className="font-sans text-sm font-bold leading-snug">
                        {feature.title}
                      </p>
                      {/* Generated listings give a title-only bullet, so the body
                          is conditional rather than an empty paragraph that adds
                          a stray 4px gap under every line. */}
                      {feature.body && (
                        <p className="mt-1 font-sans text-sm leading-relaxed text-black/75">
                          <RichText text={feature.body} />
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {extras.inTheBox.length > 0 && (
            <Panel>
              <PanelHeading>What&rsquo;s in the box</PanelHeading>
              <ul className="flex flex-col gap-2 pt-4">
                {extras.inTheBox.map((item) => (
                  <li key={item} className="font-sans text-sm leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <Panel>
          <PanelHeading>Specifications</PanelHeading>
          {/* The product's own short spec table is already the first rows of
              `extras.specifications` for a generated listing, so this renders
              one table for both tiers rather than repeating the fields. */}
          <SpecTable rows={specRows} className="mt-2" />
        </Panel>
      </div>
    </div>
  );
}
