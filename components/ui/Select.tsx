import type { SelectHTMLAttributes } from "react";

// Shared select control. The class string below is identical to the one that
// was previously hand-duplicated in the checkout state picker and in
// ApplicationForm, so substituting it is visually a no-op.
const base =
  "min-h-[44px] rounded-md border border-line bg-white px-3 py-2 font-sans " +
  "focus:border-accent focus:ring-2 focus:ring-accent/40 focus:outline-none";

// `w-full` is applied separately because Tailwind generates it after `w-auto`,
// so an appended `w-auto` in className would lose to it. Inline selects opt out.
const WIDTH_FULL = "w-full";

interface SelectBase extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Label shown for the empty option; pass `null` to omit the placeholder. */
  placeholder?: string | null;
  /** Set false for compact inline selectors (e.g. a cart quantity picker). */
  fullWidth?: boolean;
}

/**
 * Exactly one of the two list shapes — never both, and never neither. Two
 * optional props would let a caller pass nothing and get an empty select.
 */
export type SelectProps =
  | (SelectBase & { options: string[]; items?: never })
  | (SelectBase & {
      /** For a list whose stored value differs from its label, e.g. an id-keyed cascade. */
      items: { value: string; label: string }[];
      options?: never;
    });

export default function Select({
  options,
  items,
  placeholder = "Select…",
  fullWidth: stretch = true,
  className = "",
  value,
  ...props
}: SelectProps) {
  const classes =
    (stretch ? WIDTH_FULL + " " : "") + base + (className ? " " + className : "");

  const rendered = items ?? (options ?? []).map((o) => ({ value: o, label: o }));

  return (
    <select value={value} className={classes} {...props}>
      {placeholder !== null && <option value="">{placeholder}</option>}
      {rendered.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
