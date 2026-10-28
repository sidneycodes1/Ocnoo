// Formatting helpers. These are pure client-safe functions; order numbers are
// now allocated by the database (public.order_number_seq), not here.

/**
 * Format a whole-Naira amount like `₦14,000` (comma thousands, no decimals).
 * Amounts are stored as whole Naira; kobo is not used in this demo dataset.
 */
export function formatNaira(amount: number): string {
  if (!Number.isFinite(amount)) return "₦0";
  // Intl uses "NGN"/"₦" depending on environment; force the ₦ symbol + grouping.
  const rounded = Math.round(amount);
  return `₦${rounded.toLocaleString("en-US")}`;
}

/**
 * Brand name → the `?brand=` slug the shop filters on. Lives here because the
 * product page builds that link and the shop page reads it; a private copy of
 * the same transform in each would eventually disagree, and the failure would
 * be a brand link that silently returns "No matches".
 */
export function brandSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Whole-percent saving against a compare-at price, or `null` when there is
 * nothing worth badge-ing. Rounded DOWN so a badge can never overstate the
 * discount, and null for an old price that is not actually higher — the
 * catalogue is hand-maintained and a reversed pair would otherwise render as
 * "-300%".
 */
export function discountPct(price: number, oldPrice?: number): number | null {
  if (oldPrice === undefined || oldPrice <= 0 || oldPrice <= price) return null;
  const pct = Math.floor(((oldPrice - price) / oldPrice) * 100);
  return pct > 0 ? pct : null;
}
