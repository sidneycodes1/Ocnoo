"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { MAILTO_LINK } from "@/lib/business";
import { CheckIcon, FacebookIcon, ShareIcon, XIcon } from "@/components/ui/icons";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25";

/** Circular icon button, sized to the 44px target the rest of the app uses. */
function ShareDisc({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-black/70 transition-colors hover:border-black/40 hover:text-black ${FOCUS_RING}`}
    >
      {children}
    </button>
  );
}

function openExternal(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Share row + the "report this listing" link, under the gallery.
 *
 * The URLs are built at click time from `window.location.href` rather than from
 * SITE_URL at render time: on a preview deploy the origin is not the one baked
 * into the build, and a share card that points at production for a page someone
 * is looking at on a branch URL is worse than no share card.
 */
export default function ProductShareRow({ product }: { product: Product }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // Detected in an effect, never at render: `navigator` does not exist on the
  // server, and a value that differs between the two renders would hydrate into
  // a button that is not there.
  useEffect(() => {
    setCanNativeShare(typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function links() {
    const url = window.location.href;
    const text = `${product.name} on OCNOO`;
    return { url, text };
  }

  async function copyLink() {
    const { url } = links();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access is refused outside a secure context and in private
      // modes. Falling back to the share sheet beats failing silently.
      if (typeof navigator.share === "function") openNative();
    }
  }

  function openNative() {
    const { url, text } = links();
    navigator.share?.({ title: text, url }).catch(() => {
      /* a dismissed share sheet is not an error */
    });
  }

  // Built without the current URL: this renders on the server first, and
  // `window.location.href` is not knowable there, so putting it in the href
  // would differ between the two renders and fail hydration. The product name
  // and slug identify the listing well enough for a report.
  const reportHref = `${MAILTO_LINK}?subject=${encodeURIComponent(
    `Incorrect product information: ${product.name}`
  )}&body=${encodeURIComponent(
    `Listing: ${product.name} (/product/${product.slug})\n\nWhat is wrong with it?\n\n`
  )}`;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="pb-2 font-sans text-sm font-bold uppercase tracking-wide">
          Share this product
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <ShareDisc
            label="Share on Facebook"
            onClick={() =>
              openExternal(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(links().url)}`
              )
            }
          >
            <FacebookIcon size={18} />
          </ShareDisc>
          <ShareDisc
            label="Share on X"
            onClick={() =>
              openExternal(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  links().text
                )}&url=${encodeURIComponent(links().url)}`
              )
            }
          >
            <XIcon size={16} />
          </ShareDisc>
          <ShareDisc
            label="Share on WhatsApp"
            onClick={() =>
              openExternal(
                `https://wa.me/?text=${encodeURIComponent(
                  `${links().text} ${links().url}`
                )}`
              )
            }
          >
            <WhatsAppIcon size={18} />
          </ShareDisc>
          {canNativeShare && (
            <ShareDisc label="More sharing options" onClick={openNative}>
              <ShareIcon size={18} />
            </ShareDisc>
          )}
          <button
            type="button"
            onClick={copyLink}
            className={`inline-flex min-h-[44px] items-center gap-1.5 px-1 font-sans text-sm text-black/60 underline underline-offset-4 hover:text-black ${FOCUS_RING}`}
          >
            {copied && <CheckIcon size={16} className="text-accent" />}
            {copied ? "Link copied" : "Copy link"}
          </button>
        </div>
      </div>

      <a
        href={reportHref}
        className={`w-fit font-sans text-sm text-black/60 underline decoration-line underline-offset-4 hover:text-black ${FOCUS_RING}`}
      >
        Report incorrect product information
      </a>
    </div>
  );
}
