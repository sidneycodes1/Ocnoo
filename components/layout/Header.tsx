"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import {
  BookmarkIcon,
  MessagesIcon,
  NotificationsIcon,
  AccountIcon,
} from "@/components/ui/icons";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Deals", href: "/shop" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Become a Reseller", href: "/become-a-reseller" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function CartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L23 6H6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

// Always-visible search. Submitting routes to /shop with the term as ?q=
// (text-search filtering itself is wired in a later phase).
function SearchBar({ className = "" }: { className?: string }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/shop?q=${encodeURIComponent(term)}` : "/shop");
  }

  return (
    <form role="search" onSubmit={onSubmit} className={`relative ${className}`}>
      <SearchIcon />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="min-h-[44px] w-full rounded-full border border-line bg-surface pl-10 pr-4 font-sans text-sm focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </form>
  );
}

// Placeholder account cluster (no real auth — links to empty-state pages).
const ACCOUNT_LINKS = [
  { href: "/saved", label: "Saved", icon: <BookmarkIcon /> },
  { href: "/messages", label: "Messages", icon: <MessagesIcon /> },
  { href: "/notifications", label: "Notifications", icon: <NotificationsIcon /> },
  { href: "/account", label: "Account", icon: <AccountIcon /> },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      {/* Top row: logo, inline search (md+), cart, hamburger */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex shrink-0 flex-col leading-none"
          onClick={() => setOpen(false)}
        >
          <span className="font-sans text-2xl font-extrabold uppercase tracking-tight">
            OCNOO
          </span>
          <span className="font-sans text-[10px] uppercase tracking-[0.2em]">
            Buy • Sell • Resell
          </span>
        </Link>

        <SearchBar className="hidden md:block md:w-72 md:max-w-md lg:flex-1" />

        <div className="ml-auto flex items-center gap-3 md:ml-0">
          {ACCOUNT_LINKS.map((l) => (
            <Button
              key={l.href}
              href={l.href}
              variant="secondary"
              aria-label={l.label}
              className="hidden h-11 w-11 shrink-0 !p-0 md:inline-flex"
            >
              {l.icon}
            </Button>
          ))}

          <Button
            href="/cart"
            variant="secondary"
            aria-label="Cart"
            className="relative h-11 w-11 shrink-0 !p-0"
          >
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-md bg-black px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Button>

          {/* Hamburger nav toggle (all widths — the only menu now that the
              desktop nav row is gone) */}
          <Button
            type="button"
            variant="secondary"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="h-11 w-11 shrink-0 !p-0"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? (
                <path d="M4 4l16 16M20 4L4 20" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile search row (always visible) */}
      <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
        <SearchBar />
      </div>

      {/* Collapsible nav (all widths) */}
      {open && (
        <nav aria-label="Main" className="border-t border-line bg-white">
          {/* Account shortcuts: menu-only below md; inline in the top row above that */}
          <div className="mx-auto grid max-w-6xl grid-cols-4 gap-2 px-4 py-4 md:hidden">
            {ACCOUNT_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-1.5 rounded-lg border border-line py-3 text-center hover:bg-surface"
              >
                {l.icon}
                <span className="font-sans text-xs font-bold uppercase">
                  {l.label}
                </span>
              </Link>
            ))}
          </div>
          <ul className="mx-auto flex max-w-6xl flex-col border-t border-line px-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="border-b border-line last:border-b-0">
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-sans text-base font-bold uppercase tracking-wide"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
