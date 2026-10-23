"use client";

import { useState } from "react";
import Link from "next/link";
import { getCategoryBySlug } from "@/data/categories";
import { formatNaira } from "@/lib/utils";
import { listingPlace, type Listing } from "@/context/ListingsContext";
import { usePhotoUrl } from "@/components/sell/usePhotoUrl";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";

interface ListingRowProps {
  listing: Listing;
  onTogglePublish: (id: string, next: Listing["status"]) => void;
  onRemove: (id: string) => void;
}

/**
 * One ad in My ads. Deleting is destructive twice over — the record goes from
 * localStorage and the photos from IndexedDB — so it asks first, exactly like the
 * address book, and the listing owns its photo keys so the row can say what is
 * about to be lost.
 */
export default function ListingRow({
  listing,
  onTogglePublish,
  onRemove,
}: ListingRowProps) {
  const [confirming, setConfirming] = useState(false);
  const cover = usePhotoUrl(listing.photoKeys[0]);
  const category = getCategoryBySlug(listing.categorySlug);

  return (
    <Card bordered className="flex gap-3 p-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-surface md:h-24 md:w-24">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-1 text-center font-sans text-[10px] uppercase tracking-wide text-black/40">
            {listing.photoKeys.length === 0 ? "No photo" : "Photo unavailable"}
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="min-w-0 flex-1 basis-full font-sans text-sm font-extrabold uppercase leading-tight tracking-wide">
            {listing.title}
          </h3>
          <Badge
            className={
              listing.status === "live" ? "bg-accent text-black" : "bg-surface text-black/70"
            }
          >
            {listing.status === "live" ? "Live" : "Draft"}
          </Badge>
        </div>

        <p className="font-mono text-sm font-bold">{formatNaira(listing.price)}</p>
        <p className="truncate font-sans text-xs text-black/60">
          {listingPlace(listing)}
          {category ? ` · ${category.name}` : ""}
          {listing.photoKeys.length > 1 ? ` · ${listing.photoKeys.length} photos` : ""}
        </p>

        {confirming ? (
          <div className="mt-1 flex flex-wrap items-center gap-2 border-t border-line pt-2">
            <p className="min-w-0 flex-1 font-sans text-sm">
              Delete this ad and its {listing.photoKeys.length} photo
              {listing.photoKeys.length === 1 ? "" : "s"} from this browser?
            </p>
            <Button
              variant="secondary"
              padding="tight"
              onClick={() => setConfirming(false)}
            >
              Keep
            </Button>
            <Button
              variant="primary"
              padding="tight"
              onClick={() => onRemove(listing.id)}
            >
              Delete
            </Button>
          </div>
        ) : (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-2">
            <Link
              href={`/sell/${listing.id}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
            >
              <PencilIcon size={16} />
              Edit
            </Link>

            <button
              type="button"
              onClick={() =>
                onTogglePublish(listing.id, listing.status === "live" ? "draft" : "live")
              }
              className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
            >
              {listing.status === "live" ? "Take down" : "Publish"}
            </button>

            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="ml-auto inline-flex min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-wide text-black/60 underline decoration-line underline-offset-4 hover:text-black"
            >
              <TrashIcon size={16} />
              Delete
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
