"use client";

import { useEffect, useState } from "react";
import AccountShell from "@/components/account/AccountShell";
import ListingRow from "@/components/listing/ListingRow";
import { useListings } from "@/context/ListingsContext";
import Button from "@/components/ui/Button";

/**
 * Every ad composed on this device, live or draft.
 *
 * The reclaim control is offered whenever unused photos exist, INCLUDING the
 * empty state. That case is the whole point: a seller who typed a title, added
 * two photos, and never posted leaves bytes behind with no listing to open, so
 * a control buried inside the list would be unreachable exactly when it is
 * needed. The count is measured from the photo store, not guessed.
 */
export default function MyAdsPage() {
  const {
    hydrated,
    myListings,
    setStatus,
    removeListing,
    sweepPhotos,
    unusedPhotoCount,
  } = useListings();
  const [sweepMessage, setSweepMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [unused, setUnused] = useState<number | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    void unusedPhotoCount().then((n) => {
      if (live) setUnused(n);
    });
    return () => {
      live = false;
    };
  }, [hydrated, unusedPhotoCount, myListings.length]);

  async function sweep() {
    setConfirming(false);
    setSweepMessage("Checking…");
    const removed = await sweepPhotos();
    setUnused(0);
    setSweepMessage(
      removed === 0
        ? "No unused photos to clear."
        : `Cleared ${removed} unused photo${removed === 1 ? "" : "s"}.`,
    );
  }

  // Rendered in both branches. The automatic reclaim on load only touches photos
  // orphaned for over an hour; this one is immediate, so it asks first — it can
  // destroy the photos of a half-written ad open in another window.
  //
  // The status line is a SIBLING of the control, not inside it. Clearing sets the
  // unused count to zero, which removes the control; nesting the message in the
  // same conditional meant a successful clear announced nothing at all.
  const orphanCount = unused ?? 0;
  const sweepBlock =
    hydrated && (orphanCount > 0 || sweepMessage !== "") ? (
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        {orphanCount > 0 &&
          (confirming ? (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <p className="min-w-0 flex-1 font-sans text-sm">
                Delete {orphanCount} photo{orphanCount === 1 ? "" : "s"} that
                {orphanCount === 1 ? " is" : " are"} not attached to a saved ad? An
                ad you are still writing in another window keeps its photos here,
                so finish that one first.
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
                onClick={() => void sweep()}
              >
                Clear
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSweepMessage("");
                setConfirming(true);
              }}
              className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
            >
              Clear {orphanCount} unused photo{orphanCount === 1 ? "" : "s"}
            </button>
          ))}
        {sweepMessage && (
          <p role="status" className="font-sans text-sm text-black/60">
            {sweepMessage}
          </p>
        )}
      </div>
    ) : null;

  return (
    <AccountShell>
      <h1 className="mb-1 font-sans text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        My Ads
      </h1>
      <p className="mb-6 font-sans text-sm text-black/60">
        Everything you have posted from this browser. Saved here only, not to an
        account.
      </p>

      {!hydrated ? (
        <p className="font-sans text-sm text-black/55">Loading your ads…</p>
      ) : myListings.length === 0 ? (
        <>
          <div className="flex flex-col gap-4">
            <p className="rounded-xl border border-line bg-surface p-4 font-sans text-sm leading-relaxed">
              You have not posted anything yet. An ad takes a photo, a price, and
              the area you are in — the location you pick is also what tells a
              buyer which delivery zone you are in.
            </p>
            <Button href="/sell" variant="primary" className="self-start">
              Post an Ad
            </Button>
          </div>
          {sweepBlock}
        </>
      ) : (
        <>
          <ul className="flex flex-col gap-4">
            {myListings.map((listing) => (
              <li key={listing.id}>
                <ListingRow
                  listing={listing}
                  onTogglePublish={setStatus}
                  onRemove={removeListing}
                />
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href="/sell" variant="secondary" padding="tight">
              Post another ad
            </Button>
          </div>
          {sweepBlock}
        </>
      )}
    </AccountShell>
  );
}
