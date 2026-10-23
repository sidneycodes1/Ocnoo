"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CartIcon, MenuIcon } from "@/components/ui/icons";

// Real destinations only. The old list carried a "Deals" entry pointing at
// /shop - the same href as "Shop" - which was a link to nowhere in particular,
// so it is gone rather than kept for looks.
// "Categories" and "Sell" are the words the mobile tab bar already uses for
// these same two hrefs, so the two breakpoints now name them identically.
// Wholesale and Contact are no longer primary nav: they stay in the footer and
// in the Menu panel, which is where a desktop visitor now looks for the rest.
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/shop" },
  { label: "Sell", href: "/sell" },
  { label: "About", href: "/about" },
];

// What the Menu panel holds on top of the links above. These are the screens
// that used to have an icon in the cluster, plus the two a visitor is most
// likely to hunt for - nothing here is reachable only from this panel.
const ACCOUNT_LINKS = [
  { label: "Saved Items", href: "/saved" },
  { label: "My Ads", href: "/my-ads" },
  { label: "Account", href: "/account" },
  { label: "Track Order", href: "/track-order" },
];

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function SearchGlyph({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

// Always-visible search. Submitting routes to /shop with the term as ?q=, and
// the field mirrors an incoming ?q= so a filtered page never shows a blank box.
// The reference puts the submit control INSIDE the field, which is what the
// absolute button below does - it is a real type=submit, so Enter and clicking
// both work.
function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTerm = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlTerm);

  // Follow external navigations (back/forward, links carrying a query) without
  // fighting what the user is typing.
  useEffect(() => {
    setQ(urlTerm);
  }, [urlTerm]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <form role="search" onSubmit={onSubmit} className={`relative ${className}`}>
      <SearchGlyph className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/45" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products, brands and more…"
        aria-label="Search products"
        className="min-h-[44px] w-full rounded-full border border-line bg-surface pl-11 pr-16 font-sans text-sm text-black placeholder:text-black/45 focus:border-line focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white transition-opacity hover:opacity-90"
      >
        <SearchGlyph size={17} />
      </button>
    </form>
  );
}

// useSearchParams bails out to client-side rendering for the whole route unless
// it sits under a Suspense boundary, so the static shell can still be prerendered.
function SearchBarSlot({ className = "" }: { className?: string }) {
  return (
    <Suspense
      fallback={
        <div
          aria-hidden="true"
          className={`min-h-[44px] rounded-full border border-line bg-surface ${className}`}
        />
      }
    >
      <SearchBar className={className} />
    </Suspense>
  );
}

// Icon-over-label cluster item, with a live count badge when there is one.
function HeaderLink({
  href,
  label,
  icon,
  count,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label}, ${count} items` : label}
      className={`flex min-h-[52px] w-[68px] flex-col items-center justify-center gap-1 text-black/70 transition-colors hover:text-black ${FOCUS_RING}`}
    >
      <span className="relative">
        {icon}
        {!!count && count > 0 && (
          <span className="absolute -right-2.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-black">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="font-sans text-[11px] uppercase tracking-wide">{label}</span>
    </Link>
  );
}

// One row inside the Menu panel. A link, not a button, and 44px tall like
// every other tap target in this build.
function MenuLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex min-h-[44px] items-center rounded-lg px-3 font-sans text-sm font-bold uppercase tracking-wide transition-colors ${
          active ? "bg-surface text-black" : "text-black/70 hover:bg-surface hover:text-black"
        } ${FOCUS_RING}`}
      >
        {label}
      </Link>
    </li>
  );
}

export default function Header() {
  const { count: cartCount } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // A navigation always closes the panel, so it can never be left hanging open
  // over a screen it has nothing to do with.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Escape closes it from wherever focus happens to be, which is the one thing
  // a mouse-less visitor needs from a disclosure.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50">
      {/* ---- Main bar: identity, search, account cluster ---- */}
      <div className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3">
          <Link
            href="/"
            className="flex min-h-[44px] shrink-0 flex-col justify-center gap-1 leading-none"
          >
            <span className="font-sans text-2xl font-extrabold uppercase tracking-tight text-black">
              OCNOO
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-black/70">
              Buy • Sell • Resell
            </span>
          </Link>

          {/* Fixed cap + justify-between on the row: the leftover space splits
              evenly either side of the field, so the logo→search and
              search→cluster gaps stay equal without a dead-air pocket. */}
          <SearchBarSlot className="hidden w-full max-w-2xl md:block" />

          {/* This whole component is mounted inside a `hidden md:block` wrapper
              and MobileHeader owns the small screens, so nothing here needs a
              responsive class: at md+ the cluster is the cart you act on and the
              Menu that holds everything else. Saved and Account used to sit here
              as icons; they are now rows inside the panel. Both 68x52, so the bar
              stays 122px tall exactly as it was with three items. */}
          <div className="relative flex shrink-0 items-center gap-1">
            <HeaderLink
              href="/cart"
              label="Cart"
              icon={<CartIcon size={22} />}
              count={cartCount}
            />
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="desktop-menu"
              onClick={() => setMenuOpen((open) => !open)}
              // One colour class per state, chosen by ternary: appending
              // `text-black` after `text-black/70` would not win, because
              // Tailwind resolves by generated order, not class-attribute order.
              className={`flex min-h-[52px] w-[68px] flex-col items-center justify-center gap-1 transition-colors ${
                menuOpen ? "text-black" : "text-black/70 hover:text-black"
              } ${FOCUS_RING}`}
            >
              <MenuIcon size={22} />
              <span className="font-sans text-[11px] uppercase tracking-wide">
                Menu
              </span>
            </button>

            {menuOpen && (
              <>
                {/* Catches the click outside the panel. It sits under the panel
                    and over the page, so the menu itself stays clickable. */}
                <div
                  aria-hidden="true"
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <nav
                  id="desktop-menu"
                  aria-label="More"
                  className="absolute right-0 top-full z-50 w-[260px] rounded-xl border border-line bg-white p-2 shadow-lift"
                >
                  <p className="px-3 pb-1 pt-2 font-sans text-[11px] uppercase tracking-[0.2em] text-black/70">
                    Browse
                  </p>
                  <ul>
                    {NAV_LINKS.map((link) => (
                      <MenuLink
                        key={link.href}
                        href={link.href}
                        label={link.label}
                        active={isActive(pathname, link.href)}
                      />
                    ))}
                  </ul>
                  <p className="px-3 pb-1 pt-3 font-sans text-[11px] uppercase tracking-[0.2em] text-black/70">
                    Your account
                  </p>
                  <ul>
                    {ACCOUNT_LINKS.map((link) => (
                      <MenuLink
                        key={link.href}
                        href={link.href}
                        label={link.label}
                        active={isActive(pathname, link.href)}
                      />
                    ))}
                  </ul>
                </nav>
              </>
            )}
          </div>
        </div>

        {/* The primary links stay visible on desktop - hiding them all behind
            one click is what makes a shop hard to browse - and the Menu button
            beside the cart opens the rest. Mobile navigation is the tab bar,
            which lives outside this component. */}
        <nav aria-label="Main" className="border-t border-line">
          <ul className="mx-auto flex max-w-6xl items-center gap-1 px-4">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      "inline-flex min-h-[44px] items-center border-b-2 px-3 font-sans text-sm font-bold uppercase tracking-wide transition-colors " +
                      (active
                        ? "border-primary text-black"
                        : "border-transparent text-black/70 hover:border-black/30 hover:text-black") +
                      " " +
                      FOCUS_RING
                    }
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
