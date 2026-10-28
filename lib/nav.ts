import { getCategoryBySlug } from "@/data/categories";
import { getCollectionMeta } from "@/data/collectionMeta";

export type ScreenLayout = "title" | "search";

export interface MobileScreen {
  title: string;
  /** `search` screens show the pill search field instead of a centred title. */
  layout: ScreenLayout;
  /** True when a back arrow should be shown (i.e. not a tab root). */
  back: boolean;
  /** True on browse/results screens where a sort control is meaningful. */
  sort: boolean;
}

// Tab roots keep `back: false` so the shell never renders a dead back arrow.
const STATIC: Record<string, Omit<MobileScreen, "sort">> = {
  "/": { title: "OCNOO", layout: "search", back: false },
  // The Categories tab lists categories on mobile, so it carries a centred
  // title like every other screen and puts its search field in the page body.
  // Desktop /shop is unaffected - it renders the product grid at md+.
  "/shop": { title: "Categories", layout: "title", back: false },
  "/account": { title: "Profile", layout: "title", back: false },
  "/account/edit-profile": { title: "Edit Profile", layout: "title", back: true },
  "/account/addresses": { title: "Address Book", layout: "title", back: true },
  "/account/connections": { title: "Connections", layout: "title", back: true },
  "/account/addresses/new": {
    title: "Add a New Address",
    layout: "title",
    back: true,
  },
  "/notifications": { title: "Notifications", layout: "title", back: false },
  "/sell": { title: "Post an Ad", layout: "title", back: true },
  "/my-ads": { title: "My Ads", layout: "title", back: true },
  "/messages": { title: "Messages", layout: "title", back: false },
  "/saved": { title: "Saved", layout: "title", back: true },
  "/purchases": { title: "My Purchases", layout: "title", back: true },
  "/cart": { title: "My Cart", layout: "title", back: true },
  "/checkout": { title: "Checkout", layout: "title", back: true },
  "/track-order": { title: "Track Order", layout: "title", back: true },
  "/wholesale": { title: "Wholesale", layout: "title", back: true },
  "/become-a-reseller": {
    title: "Become a Reseller",
    layout: "title",
    back: true,
  },
  "/contact": { title: "Contact Us", layout: "title", back: true },
  "/about": { title: "About OCNOO", layout: "title", back: true },
  "/about/terms": { title: "Terms & Conditions", layout: "title", back: true },
  "/about/privacy": { title: "Privacy Policy", layout: "title", back: true },
  "/about/billing-policy": {
    title: "Billing Policy",
    layout: "title",
    back: true,
  },
  "/about/copyright-policy": {
    title: "Copyright Policy",
    layout: "title",
    back: true,
  },
  "/safety-tips": { title: "Safety Tips", layout: "title", back: true },
  "/faq": { title: "FAQ", layout: "title", back: true },
};

export function resolveScreen(pathname: string): MobileScreen {
  const staticMatch = STATIC[pathname];
  if (staticMatch) {
    return {
      ...staticMatch,
      sort: pathname === "/shop" || pathname.startsWith("/shop/"),
    };
  }

  // /shop/<category> — the category name is the screen title.
  const shopMatch = pathname.match(/^\/shop\/([^/]+)$/);
  if (shopMatch) {
    const cat = getCategoryBySlug(decodeURIComponent(shopMatch[1]));
    return {
      title: cat?.name ?? "Category",
      layout: "title",
      back: true,
      sort: true,
    };
  }

  // /collections/<key> — the full list behind a home section's "More >" link.
  // Only the title is needed here, which is why it comes from the metadata file
  // rather than the catalogue: the header is a client component and must not
  // pull every product into the browser bundle to label a screen.
  const collectionMatch = pathname.match(/^\/collections\/([^/]+)$/);
  if (collectionMatch) {
    const collection = getCollectionMeta(decodeURIComponent(collectionMatch[1]));
    if (collection) {
      return {
        title: collection.title,
        layout: "title",
        back: true,
        sort: false,
      };
    }
  }

  // /track-order/<number> and /track-order/<number>/history. The order number
  // is not a screen title - the title says what the screen is.
  if (/^\/track-order\/[^/]+$/.test(pathname)) {
    return { title: "Order Details", layout: "title", back: true, sort: false };
  }
  if (/^\/track-order\/[^/]+\/history$/.test(pathname)) {
    return {
      title: "Package History",
      layout: "title",
      back: true,
      sort: false,
    };
  }

  // /account/addresses/<id> - editing a saved address.
  if (/^\/account\/addresses\/[^/]+$/.test(pathname)) {
    return { title: "Edit Address", layout: "title", back: true, sort: false };
  }

  // /sell/<id> - editing an ad that is already posted. The composer itself is
  // "/sell", which is a static entry above.
  if (/^\/sell\/[^/]+$/.test(pathname)) {
    return { title: "Edit Ad", layout: "title", back: true, sort: false };
  }

  if (pathname.startsWith("/product/")) {
    return { title: "Item", layout: "title", back: true, sort: false };
  }

  return { title: "OCNOO", layout: "title", back: true, sort: false };
}

/** Tab bar destinations. `match` decides which tab is active for a pathname. */
export const TABS = [
  { key: "discover", label: "Discover", href: "/", match: ["/"] },
  {
    key: "categories",
    label: "Categories",
    href: "/shop",
    match: ["/shop", "/product"],
  },
  {
    key: "sell",
    label: "Sell",
    href: "/sell",
    match: ["/sell", "/my-ads"],
  },
  {
    key: "notifications",
    label: "Notifications",
    href: "/notifications",
    match: ["/notifications"],
  },
  {
    key: "profile",
    label: "Profile",
    href: "/account",
    match: ["/account", "/saved", "/messages", "/purchases"],
  },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export function activeTab(pathname: string): TabKey | null {
  for (const tab of TABS) {
    if (tab.key === "sell") continue; // a destination, not a section — never highlighted
    if (tab.match.some((m) => (m === "/" ? pathname === "/" : pathname.startsWith(m)))) {
      return tab.key;
    }
  }
  return null;
}

/**
 * Deterministic parent for the back arrow. Deliberately not `router.back()`:
 * a deep link or a shared URL has no history to go back to, which would leave
 * the arrow doing nothing.
 *
 * `search` is the current URL's query string, leading `?` included. Only the
 * order pages need it: they are readable with the `?t=` token and nothing
 * without it, so a back arrow that strips the query walks the customer out of
 * their own order.
 */
export function parentOf(pathname: string, search = ""): string {
  if (pathname.startsWith("/product/")) return "/shop";
  if (pathname.startsWith("/shop/")) return "/shop";
  // Reached from a home section, so back goes home rather than to /shop, which
  // these pages are not part of.
  if (pathname.startsWith("/collections/")) return "/";
  if (/^\/track-order\/[^/]+\/history$/.test(pathname)) {
    return pathname.replace(/\/history$/, "") + search;
  }
  if (pathname.startsWith("/track-order/")) return "/track-order";
  if (pathname === "/account/addresses/new") return "/account/addresses";
  if (pathname.startsWith("/account/addresses/")) return "/account/addresses";
  // An ad is edited from the list, so back returns to the list rather than to
  // the blank composer.
  if (pathname.startsWith("/sell/")) return "/my-ads";
  if (pathname === "/my-ads") return "/account";
  if (pathname.startsWith("/account/")) return "/account";
  if (pathname === "/checkout") return "/cart";
  if (pathname === "/cart") return "/";
  if (["/saved", "/messages", "/purchases"].includes(pathname)) return "/account";
  if (pathname.startsWith("/about/")) return "/about";
  return "/";
}

/**
 * Screens that own the bottom of the viewport with their own action bar. The
 * reference item screen shows Add to Cart / Buy Now where the tab bar would
 * otherwise be, and checkout is a full-screen funnel — so the tab bar is
 * dropped on both instead of stacking two `bottom-0` fixed bars.
 */
export function showTabBar(pathname: string): boolean {
  if (pathname.startsWith("/product/")) return false;
  if (pathname === "/checkout") return false;
  return true;
}

/** Which fixed bar, if any, owns the bottom edge of a screen. */
export type BottomBar = "tabbar" | "actionbar" | "none";

/**
 * The in-flow spacer must match whatever bar the route actually renders, or
 * the last block of content scrolls underneath it. Heights are the rendered
 * box of each bar plus its 1px top border:
 *   tab bar    56px row                     -> 57px
 *   action bar 12 + 44 + 12 row             -> 69px
 * Both bars add `pb-safe`, which the utilities in globals.css re-add.
 */
export function bottomBar(pathname: string): BottomBar {
  if (pathname.startsWith("/product/")) return "actionbar";
  if (pathname === "/checkout") return "none";
  return "tabbar";
}
