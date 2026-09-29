// Formatting + demo helpers. No backend — these are pure client-safe utilities.

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
 * Generate a believable, random order number like `OCN-83920` (5 digits).
 * Demo-only — not persisted anywhere.
 */
export function generateOrderNumber(): string {
  const digits = Math.floor(10000 + Math.random() * 90000); // 10000–99999
  return `OCN-${digits}`;
}
