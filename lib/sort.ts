/** Values accepted by the `?sort=` param. */
export type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Newest first" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Top rated" },
];

export function isSortKey(value: string | undefined): value is SortKey {
  return SORT_OPTIONS.some((o) => o.key === value);
}
