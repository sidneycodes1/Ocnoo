import type { Metadata } from "next";

/**
 * Absolute origin for metadataBase, robots.txt and sitemap.xml.
 *
 * On Vercel, set NEXT_PUBLIC_SITE_URL to the production domain. The VERCEL_*
 * fallbacks are deliberate: a preview deploy then describes itself instead of
 * pointing its sitemap at production, and `VERCEL_PROJECT_PRODUCTION_URL` is
 * only populated in production builds, so previews drop to `VERCEL_URL`. The
 * localhost tail exists so a plain `new URL(...)` can never throw during a
 * local build and take the whole deploy down with it.
 *
 * A scheme-less value is repaired rather than rejected: someone setting
 * NEXT_PUBLIC_SITE_URL=ocnoo.com by hand in the Vercel dashboard is the normal
 * case, and `new URL()` throwing on it would fail the build for a typo.
 */
export const SITE_URL: string = (() => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL}`
      : "http://localhost:3000");
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, "");
})();

/**
 * Surfaces that exist only inside the browser that created them - listings,
 * cart, orders, saved items, addresses. There is no account and no server, so a
 * crawler would index an empty shell, and a search result pointing at someone
 * else's "My ads" would be worse than not being indexed at all.
 *
 * One list feeds robots.txt AND the per-route noindex, so the two cannot drift.
 * "/track-order/" keeps its trailing slash on purpose: the form itself is
 * indexable, only the order-number pages under it are private.
 */
export const PRIVATE_PATHS = [
  "/account",
  "/cart",
  "/checkout",
  "/messages",
  "/my-ads",
  "/notifications",
  "/purchases",
  "/saved",
  "/sell",
  "/track-order/",
] as const;

/**
 * Title + noindex for a browser-only screen, in the same "X — OCNOO Online
 * Store" shape every already-titled route uses. Returns a fresh object each
 * call so no two routes share one mutable metadata reference.
 */
export function privateMeta(title: string): Metadata {
  return {
    title: `${title} — OCNOO Online Store`,
    robots: { index: false, follow: false },
  };
}
