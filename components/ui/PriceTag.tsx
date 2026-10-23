import { formatNaira } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

// Desktop keeps the monospace convention; `shell` is the app-shell treatment
// (bold amber ink with an optional struck original). The font restore is
// explicit at `md:` so a shared call site cannot leak the mobile typography,
// but the colour is now the same at both widths: prices are amber everywhere.
const sizes: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
};

const tones = {
  mono: (s: string) => `font-mono ${s}`,
  bold: (s: string) => `font-mono ${s} font-bold`,
  shell: (s: string) =>
    `font-sans ${s} font-bold text-accent-ink ` + `md:font-mono md:font-normal`,
} as const;

type Weight = keyof typeof tones;

interface PriceTagProps {
  price: number;
  /** Pre-discount price. Rendered struck-through; only in `shell` tone. */
  oldPrice?: number;
  tone?: Weight;
  size?: Size;
  className?: string;
}

export default function PriceTag({
  price,
  oldPrice,
  tone = "mono",
  size = "md",
  className = "",
}: PriceTagProps) {
  const cls = tones[tone](sizes[size]);

  if (tone !== "shell" || oldPrice === undefined || oldPrice <= price) {
    return <span className={`${cls} ${className}`.trim()}>{formatNaira(price)}</span>;
  }

  return (
    <span className={`flex flex-wrap items-baseline gap-2 ${className}`.trim()}>
      <span className={cls}>{formatNaira(price)}</span>
      <span className="font-mono text-xs text-black/40 line-through md:hidden">
        {formatNaira(oldPrice)}
      </span>
    </span>
  );
}
