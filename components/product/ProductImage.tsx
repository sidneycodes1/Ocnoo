"use client";

import { useState } from "react";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { photoSrc } from "@/lib/photoUrl";

interface ProductImageProps {
  /** `product.images` - Storage object paths, with absolute URLs passed through. */
  paths: readonly string[];
  alt: string;
  /** Slot within `paths`. Out-of-range values fall back to the first photo. */
  index?: number;
  /**
   * `thumb` swaps in the `<base>-thumb.jpg` variant the admin uploader writes,
   * so a 56px strip does not download the full-size photo.
   */
  variant?: "full" | "thumb";
  /**
   * Box classes for the media element. The placeholder receives the same
   * classes, so a slot keeps its size whether or not a photo exists.
   */
  className?: string;
  /** Placeholder caption, shown when there is no photo or the URL 404s. */
  label?: string;
  iconSize?: number;
  /** Above-the-fold images opt out of lazy loading. */
  priority?: boolean;
}

/**
 * The one component that turns a product's stored photo paths into pixels.
 *
 * A missing photo, an unpublished-then-emptied gallery and a deleted Storage
 * object all end up in the same place - the placeholder frame - because the
 * storefront cannot verify a Storage object exists without fetching it. The
 * `onError` handler is what makes a stale path degrade instead of rendering a
 * broken-image icon to a client.
 */
export default function ProductImage({
  paths,
  alt,
  index = 0,
  variant = "full",
  className = "aspect-square w-full bg-surface",
  label,
  iconSize,
  priority = false,
}: ProductImageProps) {
  // Remembered per src rather than as a boolean: when the admin replaces the
  // photo at the same path, the src string changes and the new one gets a
  // fresh attempt without remounting the component.
  const [failed, setFailed] = useState<string | null>(null);

  const src = photoSrc(paths[index] ?? paths[0], variant);

  if (!src || failed === src) {
    return (
      <PlaceholderImage
        iconSize={iconSize}
        label={label}
        className={`${className} flex items-center justify-center`}
      />
    );
  }

  return (
    // A plain <img>, not next/image: the photos live on the Supabase project's
    // storage host, which is only known at deploy time, and next/image would
    // need that host in `remotePatterns` at build time. Every call site fixes
    // the box with CSS, so there is no layout shift to protect against.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(src)}
      className={`${className} object-cover`}
    />
  );
}
