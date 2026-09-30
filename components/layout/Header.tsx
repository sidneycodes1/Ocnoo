"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";

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

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex flex-col leading-none" onClick={() => setOpen(false)}>
          <span className="font-sans text-2xl font-extrabold uppercase tracking-tight">
            OCNOO
          </span>
          <span className="font-sans text-[10px] uppercase tracking-[0.2em]">
            Buy • Sell • Resell
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-sans text-sm font-bold uppercase tracking-wide hover:underline hover:underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
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

          {/* Mobile hamburger */}
          <Button
            type="button"
            variant="secondary"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="h-11 w-11 shrink-0 !p-0 lg:hidden"
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

      {/* Mobile menu */}
      {open && (
        <nav className="border-t-2 border-black bg-white lg:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label} className="border-b border-black last:border-b-0">
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
