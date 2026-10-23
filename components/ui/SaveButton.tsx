"use client";

import { useSaved } from "@/context/SavedContext";
import { HeartIcon } from "@/components/ui/icons";

interface SaveButtonProps {
  productId: string;
  productName: string;
  /** `plain` sits inside a card; `disc` floats over the product gallery. */
  variant?: "plain" | "disc";
  className?: string;
}

// The Saved feature had no write path before this control existed — the header
// icon, the account tile and /saved all rendered an empty list nothing could
// ever fill. Initial client render uses the empty state, so it matches the
// server HTML and only updates after the effect runs.
export default function SaveButton({
  productId,
  productName,
  variant = "plain",
  className = "",
}: SaveButtonProps) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(productId);

  const shell =
    variant === "disc"
      ? "flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-soft"
      : "flex h-11 w-11 items-center justify-center rounded-full text-black/45";

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from saved` : `Save ${productName}`}
      className={`${shell} ${className}`.trim()}
    >
      <HeartIcon
        size={variant === "disc" ? 20 : 22}
        filled={saved}
        className={saved ? "text-accent" : ""}
      />
    </button>
  );
}
