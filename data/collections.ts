import type { Product } from "@/types";
import { products } from "@/data/products";

/**
 * The three curated lists the home page shows a slice of and its "More >" link
 * opens in full. Each one is a real ordering over the whole catalogue rather
 * than a hand-picked set, so the row on the home page and the page behind it
 * can never disagree - they are the same array, sliced.
 */
export interface Collection {
  /** URL segment under /collections. */
  key: string;
  title: string;
  /** One line under the page title: what the order actually means. */
  blurb: string;
  /** The whole catalogue, in this collection's order. What the page shows. */
  products: Product[];
  /** The slice the home row shows. Chosen so the three rows stay distinct. */
  home: Product[];
}

const byRating = (a: Product, b: Product) =>
  (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);

const byReviewCount = (a: Product, b: Product) =>
  (b.reviewCount ?? 0) - (a.reviewCount ?? 0);

/**
 * Copies, not the source array: Array.prototype.sort mutates in place, and
 * sorting `products` here would silently reorder every other consumer.
 */
const BY_RATING = [...products].sort(byRating);
const BY_REVIEW_COUNT = [...products].sort(byReviewCount);

export const TOP_RATED: Collection = {
  key: "top-rated",
  title: "Top Rated",
  blurb: "Every product in the catalogue, best rated first.",
  products: BY_RATING,
  home: BY_RATING.slice(0, 10),
};

export const POPULAR: Collection = {
  key: "popular-right-now",
  title: "Popular Right Now",
  blurb: "Ranked by how many reviews each product has.",
  products: BY_REVIEW_COUNT,
  home: products.slice(0, 8),
};

/**
 * There is no date field on a product, so this is the order the catalogue is
 * written in - not a claim about when anything was stocked. The blurb says so
 * rather than inventing an "added on" signal the data does not have. The home
 * row takes the second window so it does not repeat "Popular Right Now".
 */
export const JUST_IN: Collection = {
  key: "just-in",
  title: "Just In",
  blurb: "The whole catalogue, in listing order.",
  products,
  home: products.slice(8, 16),
};

export const COLLECTIONS: Collection[] = [TOP_RATED, POPULAR, JUST_IN];

export function getCollection(key: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}
