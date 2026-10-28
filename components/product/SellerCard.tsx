"use client";

import type { PerformanceWord, SellerInfo } from "@/types";
import { useFollowingSellers } from "@/context/SellersContext";
import Button from "@/components/ui/Button";
import { CheckIcon, StarIcon } from "@/components/ui/icons";

/**
 * What each performance word looks like. The WORD is always printed next to the
 * glyph, so colour and shape are decoration, never the only carrier of meaning.
 */
function Mark({ value }: { value: PerformanceWord }) {
  const strong = value === "Excellent" || value === "Good";
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
        strong ? "bg-tint-mint text-black" : "bg-surface text-black/70"
      }`}
    >
      {value === "Average" || value === "Fair" ? (
        <CheckIcon size={13} />
      ) : (
        <StarIcon size={12} />
      )}
    </span>
  );
}

/**
 * The seller block.
 *
 * For OCNOO this is the shop itself, not a third-party vendor — see OCNOO_STORE
 * in data/productExtras.ts for why a marketplace-style card would misrepresent
 * a single-vendor store. The score and follower figures are demo data.
 */
export default function SellerCard({ seller }: { seller: SellerInfo }) {
  const { isFollowing, toggle, hydrated } = useFollowingSellers();
  const following = isFollowing(seller.name);
  // The stored follower count is a demo figure; a device that follows the store
  // is shown as +1 so the control visibly does something it can undo.
  const followers = seller.followers + (hydrated && following ? 1 : 0);

  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <h2 className="border-b border-line pb-3 font-sans text-[11px] font-bold uppercase tracking-[0.12em] text-black/60">
        Seller information
      </h2>

      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <p className="font-sans text-base font-bold leading-snug">{seller.name}</p>
          <p className="mt-0.5 font-sans text-xs text-black/55">{seller.tagline}</p>
          <p className="mt-2 font-sans text-sm">
            <span className="font-bold">{seller.scorePct}%</span>{" "}
            <span className="text-black/70">seller score</span>
          </p>
          <p className="font-sans text-sm text-black/70">
            {followers} {followers === 1 ? "follower" : "followers"}
          </p>
        </div>

        <Button
          variant={following ? "secondary" : "primary"}
          onClick={() => toggle(seller.name)}
          aria-pressed={following}
          className="shrink-0 self-start"
        >
          {following ? "Following" : "Follow"}
        </Button>
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <div className="flex items-center gap-2">
          <h3 className="font-sans text-sm font-bold">Seller performance</h3>
          {/* A disclosure rather than a tooltip: a hover-only explanation is
              unreachable by keyboard and by thumb, and this one carries the
              "these are demo figures" sentence that has to be discoverable. */}
          <details className="relative">
            <summary
              aria-label="How these ratings are worked out"
              className="flex h-6 w-6 cursor-pointer list-none items-center justify-center rounded-full border border-line font-sans text-[11px] font-bold text-black/60 [&::-webkit-details-marker]:hidden"
            >
              i
            </summary>
            <p className="absolute left-0 top-8 z-20 w-64 rounded-lg border border-line bg-white p-3 text-xs leading-relaxed shadow-lift">
              Scores summarise how this store has handled recent orders. The
              figures on this page are demonstration data, not measured OCNOO
              performance.
            </p>
          </details>
        </div>

        <ul className="mt-2 flex flex-col gap-2">
          {seller.performance.map((row) => (
            <li key={row.label} className="flex items-center gap-2 font-sans text-sm">
              <Mark value={row.value} />
              <span className="text-black/70">{row.label}:</span>{" "}
              <span className="font-bold">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
