import { StarIcon } from "@/components/ui/icons";

interface RatingProps {
  /** 0–5, rounded to the nearest whole star for the glyph fill. */
  value: number;
  count?: number;
  size?: number;
  className?: string;
}

// Amber star row from the reference. Uses the existing `accent` token, which is
// already the same amber — no new colour needed.
export default function Rating({
  value,
  count,
  size = 14,
  className = "",
}: RatingProps) {
  const filled = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <span className={`flex items-center gap-1 ${className}`}>
      <span className="flex items-center gap-0.5 text-accent" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon
            key={i}
            size={size}
            filled={i < filled}
            className={i < filled ? "" : "text-black/20"}
          />
        ))}
      </span>
      <span className="sr-only">{`${value.toFixed(1)} out of 5 stars`}</span>
      {count !== undefined && (
        <span className="font-sans text-xs text-black/50">({count})</span>
      )}
    </span>
  );
}
