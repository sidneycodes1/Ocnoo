"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ContactMenu from "@/components/layout/ContactMenu";

/**
 * The desktop account rail. Modelled on the reference dashboard's "My Account"
 * column: the same six destinations on every account screen, so the visitor can
 * jump sideways instead of backing out one level at a time.
 *
 * Mobile never sees this - the Profile tab's chevron groups already are the
 * navigation, and stacking both would double-list the same destinations.
 */
const LINKS = [
  { href: "/account", label: "My Account" },
  { href: "/account/edit-profile", label: "Account Information" },
  { href: "/account/addresses", label: "Address Book" },
  { href: "/account/connections", label: "Connections" },
  { href: "/my-ads", label: "My Ads" },
  { href: "/purchases", label: "My Orders" },
  { href: "/track-order", label: "Track Order" },
  { href: "/saved", label: "Saved Items" },
];

export default function AccountRail() {
  const pathname = usePathname();

  // /account/addresses/<id> belongs to the Address Book row.
  const isActive = (href: string) =>
    href === "/account"
      ? pathname === "/account"
      : href === "/account/addresses"
        ? pathname.startsWith("/account/addresses")
        : pathname.startsWith(href);

  return (
    // No `overflow-hidden` on the nav: the contact dropdown is absolutely
    // positioned inside this box, and clipping it would hide half the channels.
    <nav
      aria-label="Account"
      className="hidden rounded-xl border border-line bg-white md:block"
    >
      {/* A heading here would land in the document outline before the page's
          own <h1>, because the rail is painted first - axe reports that as a
          heading-order violation on every account screen except /account. The
          <nav> is already labelled "Account", so this is a visual column title
          and nothing is lost by it not being a heading. */}
      <p className="border-b border-line px-4 py-3 font-sans text-sm font-extrabold uppercase tracking-wide">
        My Account
      </p>
      <ul>
        {LINKS.map((l) => {
          const active = isActive(l.href);
          return (
            <li key={l.href} className="border-b border-line last:border-b-0">
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex min-h-[44px] items-center px-4 font-sans text-sm " +
                  (active
                    ? "bg-surface font-extrabold"
                    : "text-black/70 hover:bg-page")
                }
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="px-4 py-3">
        <ContactMenu variant="pill" className="w-full" />
      </div>
    </nav>
  );
}
