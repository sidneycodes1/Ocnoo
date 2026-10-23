"use client";

import { useEffect, useState } from "react";
import { getPhoto } from "@/lib/images/idb";

/**
 * An object URL for one stored photo, revoked when the caller stops needing it.
 *
 * Returns "" until the blob is found, which lets a tile draw its placeholder
 * instead of a broken image — the honest state for a photo the browser has
 * evicted. Revocation is the reason this is a hook rather than a helper: a
 * `blob:` URL pins the underlying bytes for the life of the document, and a
 * seller scrolling My-ads with eight photos per listing would otherwise hold
 * hundreds of megabytes the page never releases.
 */
export function usePhotoUrl(
  key: string | undefined,
  which: "full" | "thumb" = "thumb",
): string {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // A stale effect must not overwrite a newer key's result, and a URL created
    // after cleanup would leak, so the guard is checked before creating.
    let alive = true;
    let created = "";
    setUrl("");

    if (!key) return;

    void (async () => {
      const record = await getPhoto(key);
      if (!alive || !record) return;
      created = URL.createObjectURL(which === "full" ? record.full : record.thumb);
      setUrl(created);
    })();

    return () => {
      alive = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [key, which]);

  return url;
}
