"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

/**
 * The storefront reads the catalogue on the server for every page, so a render
 * error here is usually a record that arrived in a shape the components did not
 * expect, or a database that paused mid-request. Without this file Next shows
 * its bare default screen, which is the one thing a customer-facing shop should
 * never show a buyer.
 *
 * Reset re-renders the segment, and the server component reads the database
 * again — so a paused free-tier project that has just woken up recovers on the
 * second tap.
 */
export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4 py-20 text-center">
      <p className="font-sans text-2xl font-extrabold uppercase tracking-tight">
        This page hit a problem
      </p>
      <p className="max-w-md font-sans text-sm leading-relaxed text-black/60">
        The shop is still open. Trying again reloads this page from the store,
        and if that fails the home page is a fresh start.
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" onClick={reset}>
          Try again
        </Button>
        <Button href="/" variant="secondary">
          Back to the shop
        </Button>
      </div>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-black/30">Reference {error.digest}</p>
      )}
    </div>
  );
}
