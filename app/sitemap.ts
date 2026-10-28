import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { COLLECTION_META } from "@/data/collectionMeta";
import { getPublishedProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site";

// Per request, like every other catalogue surface: an unpublished product must
// leave the sitemap at the same moment it leaves the shop.
export const dynamic = "force-dynamic";

/**
 * Served at /sitemap.xml. Every entry is generated from the same source the
 * pages themselves resolve their params from - the published catalogue in the
 * shared database - so a URL in here cannot 404 and an unpublished product does
 * not sit in Google waiting for a re-crawl.
 *
 * Only crawlable surfaces appear. The browser-only screens in PRIVATE_PATHS are
 * excluded here as well as being disallowed in robots.txt and noindexed at the
 * route, because a sitemap entry is an invitation to fetch something that is
 * empty for everyone who did not create it.
 *
 * lastModified is the request time, not per-row edit time: the catalogue is
 * read per request, so "now" is the honest upper bound on when the content may
 * have changed. It is not used as a freshness hint for caching.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProducts();
  const lastModified = new Date();
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  });

  const staticRoutes = [
    entry("/", 1),
    entry("/shop", 0.9),
    entry("/wholesale", 0.7),
    entry("/become-a-reseller", 0.7),
    entry("/track-order", 0.6),
    entry("/about", 0.5),
    entry("/contact", 0.5),
    entry("/faq", 0.5),
    entry("/safety-tips", 0.5),
    entry("/about/terms", 0.3),
    entry("/about/privacy", 0.3),
    entry("/about/billing-policy", 0.3),
    entry("/about/copyright-policy", 0.3),
  ];

  return [
    ...staticRoutes,
    ...categories.map((c) => entry(`/shop/${c.slug}`, 0.8)),
    ...COLLECTION_META.map((c) => entry(`/collections/${c.key}`, 0.8)),
    ...products.map((p) => entry(`/product/${p.slug}`, 0.9)),
  ];
}
