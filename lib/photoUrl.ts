import { publicPhotoUrl } from "@/lib/supabase";

/**
 * Product photos are stored as bucket object paths ("photos/abc.jpg"), with the
 * thumbnail beside them as "photos/abc-thumb.jpg". Legacy "/images/…" values and
 * absolute URLs pass straight through, so the seed catalogue and an uploaded
 * photo render through the same helper.
 */
export function photoSrc(path: string | undefined, variant: "full" | "thumb" = "full"): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;

  const objectPath =
    variant === "thumb" ? path.replace(/(\.[a-z0-9]+)$/i, "-thumb$1") : path;
  return publicPhotoUrl(objectPath);
}
