import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { COLLECTIONS } from "@/data/collections";
import { products } from "@/data/products";
import { SITE_URL } from "@/lib/site";

/**
 * Served at /sitemap.xml. Every entry is generated from the same data the pages
 * themselves resolve their params from, so a URL in here cannot 404 - a
 * hand-maintained list is the thing that rots.
 *
 * Only crawlable surfaces appear. The browser-only screens in PRIVATE_PATHS are
 * excluded here as well as being disallowed in robots.txt and noindexed at the
 * route, because a sitemap entry is an invitation to fetch something that is
 * empty for everyone who did not create it.
 *
 * lastModified is build time, not per-row edit time: this catalogue ships inside
 * the code, so a page's content genuinely does change exactly when the build
 * does. Claiming finer-grained dates would be inventing them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
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
    ...COLLECTIONS.map((c) => entry(`/collections/${c.key}`, 0.8)),
    ...products.map((p) => entry(`/product/${p.slug}`, 0.9)),
  ];
}
