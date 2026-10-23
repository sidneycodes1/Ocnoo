import type { Profile } from "@/context/ProfileContext";
import { AccountIcon } from "@/components/ui/icons";

function initials(p: Profile): string {
  const first = p.firstName.trim().charAt(0);
  const last = p.lastName.trim().charAt(0);
  const both = `${first}${last}`.trim();
  return (both || p.username.trim().charAt(0) || "").toUpperCase();
}

interface AvatarProps {
  profile: Profile;
  /** Rendered diameter in px. */
  size?: number;
  className?: string;
}

/**
 * The visitor's picture, their initials, or a generic person glyph - in that
 * order. Nothing here is a broken image placeholder: if no photo has been
 * chosen the initials are the intended state, not a missing asset.
 */
export default function Avatar({ profile, size = 80, className = "" }: AvatarProps) {
  const box = { width: size, height: size };
  const shell =
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-black/45 " +
    className;

  if (profile.photoDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.photoDataUrl}
        alt=""
        style={box}
        className={`rounded-full object-cover ${className}`}
      />
    );
  }

  const letters = initials(profile);

  return (
    <span style={box} className={shell}>
      {letters ? (
        <span
          className="font-sans font-extrabold leading-none"
          style={{ fontSize: Math.round(size * 0.36) }}
          aria-hidden="true"
        >
          {letters}
        </span>
      ) : (
        <AccountIcon size={Math.round(size * 0.5)} />
      )}
    </span>
  );
}
