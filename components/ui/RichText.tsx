import type { ReactNode } from "react";

/**
 * Renders the `**bold**` markers used by the deep-dive copy in
 * data/productExtras.ts.
 *
 * The alternative was a markdown dependency (or MDX) for one inline format,
 * which is not worth the bundle or the authoring surface. Only balanced
 * `**...**` pairs become <strong>; a stray marker is left as literal text, so a
 * typo in the copy reads as a typo instead of silently swallowing the rest of
 * the paragraph.
 */
const BOLD_PAIR = /\*\*([^*]+)\*\*/g;

export function renderRichLine(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  // The regex is module-level and `g`, so its lastIndex has to be reset before
  // every call — otherwise the second paragraph in a list starts where the
  // first one stopped and loses its leading text.
  BOLD_PAIR.lastIndex = 0;
  while ((match = BOLD_PAIR.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
    nodes.push(
      <strong key={match.index} className="font-bold">
        {match[1]}
      </strong>
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));

  return nodes;
}

export default function RichText({ text }: { text: string }) {
  return <>{renderRichLine(text)}</>;
}
