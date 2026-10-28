import { discountPct, formatNaira } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

// Desktop keeps the monospace convention; `shell` is the app-shell treatment
// (bold amber ink with the struck original and a discount chip). The font is
// explicit at `md:` so a shared call site cannot leak the mobile typography,
// but the colour is now the same at both widths: prices are amber everywhere.
const sizes: Record<Size, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
  xl: "text-2xl",
};

/**
 * The compare-at and the chip scale with the price they sit beside. Kept as a
 * map rather than one fixed size: the same component renders a 140px tile
 * caption and the 32px hero price on the product page.
 */
const compareSizes: Record<Size, string> = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
  xl: "text-base",
};

const chipSizes: Record<Size, string> = {
  sm: "px-1 py-px text-[10px]",
  md: "px-1.5 py-px text-[11px]",
  lg: "px-1.5 py-0.5 text-xs",
  xl: "px-2 py-0.5 text-sm",
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

/**
 * The `shell` row is price + compare-at + discount chip.
 *
 * The compare-at used to be `md:hidden`, which meant a desktop shopper never
 * saw what was saved — and no percentage existed at any width. Both now render
 * everywhere, because "how good is this price?" is the question a listing has to
 * answer. `flex-wrap` is what keeps a narrow tile from clipping them.
 */
export default function PriceTag({
  price,
  oldPrice,
  tone = "mono",
  size = "md",
  className = "",
}: PriceTagProps) {
  const cls = tones[tone](sizes[size]);
  const pct = discountPct(price, oldPrice);

  if (tone !== "shell" || pct === null || oldPrice === undefined) {
    return <span className={`${cls} ${className}`.trim()}>{formatNaira(price)}</span>;
  }

  return (
    <span className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`.trim()}>
      <span className={cls}>{formatNaira(price)}</span>
      <span className={`${compareSizes[size]} font-mono text-black/40 line-through`}>
        <span className="sr-only">was </span>
        {formatNaira(oldPrice)}
      </span>
      <span
        className={`${chipSizes[size]} inline-block rounded-md bg-accent font-sans font-bold leading-none text-black`}
      >
        -{pct}%<span className="sr-only"> off</span>
      </span>
    </span>
  );
}
