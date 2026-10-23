import type { MetadataRoute } from "next";
import { PRIVATE_PATHS, SITE_URL } from "@/lib/site";

/**
 * Served at /robots.txt. The Disallow list is the same PRIVATE_PATHS constant
 * the routes use for their noindex, so crawling and indexing stay in lockstep.
 * Disallow (rather than nothing) is the belt to the meta noindex's braces: a
 * URL that is only ever reached through a logged-out, storage-empty shell has
 * no reason to be fetched at all.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_PATHS],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
