/**
 * Titles and blurbs for the three curated lists. Deliberately separate from the
 * products they contain: the mobile header reads collection titles on the
 * client, and importing the catalogue just to render a screen title would pull
 * every product into the browser bundle.
 */
export interface CollectionMeta {
  /** URL segment under /collections. */
  key: string;
  title: string;
  /** One line under the page title: what the ordering actually means. */
  blurb: string;
  /** How many products the home row shows. */
  homeSize: number;
}

export const COLLECTION_META: CollectionMeta[] = [
  {
    key: "top-rated",
    title: "Top Rated",
    blurb: "Every product in the catalogue, best rated first.",
    homeSize: 10,
  },
  {
    key: "popular-right-now",
    title: "Popular Right Now",
    blurb: "Ranked by how many reviews each product has.",
    homeSize: 8,
  },
  {
    key: "just-in",
    title: "Just In",
    blurb: "The most recently published products, newest first.",
    homeSize: 8,
  },
];

export function getCollectionMeta(key: string): CollectionMeta | undefined {
  return COLLECTION_META.find((collection) => collection.key === key);
}
