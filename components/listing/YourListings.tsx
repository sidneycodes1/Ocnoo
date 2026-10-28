"use client";

import { getCategoryBySlug } from "@/data/categories";
import { formatNaira } from "@/lib/utils";
import {
  listingPlace,
  useListings,
  type Listing,
} from "@/context/ListingsContext";
import { usePhotoUrl } from "@/components/sell/usePhotoUrl";
import Card from "@/components/ui/Card";
import HorizontalScrollRow from "@/components/sections/HorizontalScrollRow";

/**
 * The seller's own live ads, surfaced on /shop so posting an ad visibly changes
 * the storefront instead of writing into a void.
 *
 * Deliberately not a link. There is no listing detail route in this build —
 * `/product/[slug]` renders the fixed catalog dataset, and pretending a user's ad
 * could be dropped into it would mean inventing a second data path through that
 * page. The row's own "More" goes to My ads, which is the real destination.
 */
function ListingTile({ listing }: { listing: Listing }) {
  const cover = usePhotoUrl(listing.photoKeys[0]);
  const category = getCategoryBySlug(listing.categorySlug);

  return (
    <Card bordered className="flex h-full flex-col overflow-hidden">
      <div className="aspect-square w-full bg-surface">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center font-sans text-[10px] uppercase tracking-[0.2em] text-black/40">
            Photo unavailable
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-2 md:p-3">
        <h3 className="line-clamp-2 font-sans text-sm font-bold leading-tight md:uppercase">
          {listing.title}
        </h3>
        {/* `truncate` alone, not `truncate line-clamp-1`: the `md:block` further
            along overrides line-clamp's `display:-webkit-box`, so the clamp was
            never in force. `truncate` gives the same single clipped line through
            white-space + text-overflow, which no later display utility undoes. */}
        <p className="hidden truncate font-sans text-xs md:block">
          {listingPlace(listing)}
          {category ? ` · ${category.name}` : ""}
        </p>
        <p className="mt-auto pt-1 font-mono text-sm font-bold md:pt-2">
          {formatNaira(listing.price)}
        </p>
      </div>
    </Card>
  );
}

export default function YourListings() {
  const { hydrated, liveListings } = useListings();
  if (!hydrated || liveListings.length === 0) return null;

  return (
    <HorizontalScrollRow
      title="Your listings"
      moreHref="/my-ads"
      items={liveListings.map((listing) => (
        <ListingTile key={listing.id} listing={listing} />
      ))}
    />
  );
}
