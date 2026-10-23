// Shared placeholder photo frame. Real product photos do not exist yet
// (public/images holds only .gitkeep), so every image slot renders this frame
// instead of a broken <img>. Kept deliberately small so swapping in
// next/image later is a single-file change.

const TINTS = [
  "bg-tint-lavender",
  "bg-tint-pink",
  "bg-tint-amber",
  "bg-tint-mint",
] as const;

/** Pastel fill for the circular brand/model tiles, rotated by index. */
export function tintAt(index: number): string {
  return TINTS[index % TINTS.length];
}

function Frame({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

interface PlaceholderImageProps {
  /** Icon glyph size in px. */
  iconSize?: number;
  /** Caption under the glyph. Omit for tight slots (cart rows, tiles). */
  label?: string;
  className?: string;
}

export default function PlaceholderImage({
  iconSize = 48,
  label,
  className = "flex aspect-square w-full items-center justify-center bg-surface",
}: PlaceholderImageProps) {
  return (
    <div className={className}>
      <div
        className={`flex flex-col items-center text-black ${
          label ? "gap-2" : ""
        }`}
      >
        <Frame size={iconSize} />
        {label && (
          <span className="px-2 text-center font-sans text-[10px] uppercase tracking-[0.2em]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
