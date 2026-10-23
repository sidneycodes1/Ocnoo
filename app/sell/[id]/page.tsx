"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import ListingForm from "@/components/sell/ListingForm";
import { useListings } from "@/context/ListingsContext";
import Button from "@/components/ui/Button";

/**
 * Edit an existing ad. Reached only from My ads, so an id that does not resolve
 * is not a 404 page — it is a list of the ads this browser actually has.
 */
export default function EditListingPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  const { hydrated, getById } = useListings();
  const listing = getById(id);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <p className="font-sans text-sm text-black/55">Loading your ad…</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        <h1 className="font-sans text-2xl font-extrabold uppercase tracking-tight">
          Ad not found
        </h1>
        <p className="rounded-xl border border-line bg-surface p-4 font-sans text-sm leading-relaxed">
          That ad is not saved in this browser. Ads live in the browser that
          posted them, so a link opened somewhere else has nothing to open.
        </p>
        <Button href="/my-ads" variant="primary" className="self-start">
          Go to My Ads
        </Button>
        <Link
          href="/sell"
          className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
        >
          Post a new ad instead
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4 md:py-8">
      <h1 className="mb-1 font-sans text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        Edit Ad
      </h1>
      <p className="mb-6 font-sans text-sm text-black/60">
        Changes save to this browser. Publishing state is set on My ads.
      </p>
      <ListingForm listing={listing} />
    </div>
  );
}
