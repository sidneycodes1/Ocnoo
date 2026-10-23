import type { Spec } from "@/types";

interface SpecTableProps {
  rows: Spec[];
  className?: string;
}

// Reference "About this product" block: grey label left, dark value right,
// hairline rule between rows, no card chrome.
export default function SpecTable({ rows, className = "" }: SpecTableProps) {
  if (rows.length === 0) return null;

  return (
    <dl className={`border-t border-line ${className}`}>
      {rows.map((row, i) => (
        <div
          key={`${row.label}-${i}`}
          className="flex items-start justify-between gap-4 border-b border-line py-3"
        >
          <dt className="font-sans text-sm text-black/50">{row.label}</dt>
          <dd className="text-right font-sans text-sm font-semibold">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
