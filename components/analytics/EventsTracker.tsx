"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCatalog } from "@/context/CatalogProvider";
import { trackEvent } from "@/lib/events";

/**
 * The whole of the storefront's analytics: one page view per navigation, plus a
 * product view when that navigation landed on a product page. No cookies, no
 * fingerprint, no third party - the rows go to the same Supabase project the
 * admin dashboard already reads.
 *
 * Mounted once in the root layout so every route is covered without each page
 * remembering to opt in. A route that adds its own event (the checkout failure
 * does) still goes through the same helper.
 */
export default function EventsTracker() {
  const pathname = usePathname();
  const { products } = useCatalog();
  // A ref, not state: this must not cause a render, and it must also stop the
  // double effect React runs in development from counting twice.
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;

    trackEvent("page_view", { path: pathname });

    // The modal route shares the /product/<slug> URL, so this covers both the
    // full page and the sheet without a second lookup.
    const product = products.find((p) => `/product/${p.slug}` === pathname);
    if (product) {
      trackEvent("product_view", { path: pathname, productId: product.id });
    }
  }, [pathname, products]);

  return null;
}
