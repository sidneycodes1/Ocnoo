"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchPillProps {
  /**
   * Route the term is submitted to. Category screens pass their own path so the
   * search stays scoped to the category the user is already standing in - only
   * `?q=` changes, the route keeps the filter.
   */
  submitTo: string;
  /** Classes for the <form>; the input itself is fixed at 44px tall. */
  className?: string;
  placeholder?: string;
}

/**
 * The pill search field, shared by the mobile header and the body of the
 * Categories screen. It is a real control: submitting navigates, and the term
 * re-reads from the URL so browser back/forward keeps the field honest.
 */
export default function SearchPill({
  submitTo,
  className = "",
  placeholder = "Search products…",
}: SearchPillProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTerm = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlTerm);

  useEffect(() => {
    setQ(urlTerm);
  }, [urlTerm]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `${submitTo}?q=${encodeURIComponent(term)}` : submitTo);
  }

  return (
    <form role="search" onSubmit={onSubmit} className={`relative ${className}`}>
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
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="min-h-[44px] w-full rounded-full border border-line bg-surface pl-10 pr-4 font-sans text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </form>
  );
}
