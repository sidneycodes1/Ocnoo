"use client";

import { useRef, useState } from "react";
import { MAX_EDGE, MAX_PHOTOS, encodePhoto } from "@/lib/images/encode";
import { putPhoto, deletePhotos } from "@/lib/images/idb";
import { usePhotoUrl } from "@/components/sell/usePhotoUrl";
import Button from "@/components/ui/Button";
import { CameraIcon, TrashIcon } from "@/components/ui/icons";

/**
 * Photo picker for a listing: choose files, get metadata-free JPEGs kept on this
 * device, in an order the seller controls.
 *
 * The pipeline lives in `lib/images/encode.ts` and this component only orchestrates
 * it, because the two things most likely to go wrong here are properties of the
 * pipeline, not the UI: a photo that keeps its GPS tag, and a photo whose decode
 * never finishes. Both are handled there.
 *
 * Three deliberate behaviours:
 *  - Files are encoded ONE AT A TIME. Eight simultaneous decodes is eight
 *    full-resolution bitmaps alive at once, which is the fastest way to kill a
 *    mid-range phone.
 *  - The input's value is cleared after every pick, so choosing the same file
 *    again is a real action rather than a dead button.
 *  - Blobs are written to IndexedDB as they succeed, so a seller who closes the
 *    tab halfway through loses at most the photo in flight — and `sweepPhotos`
 *    collects what no listing ever referenced.
 */

interface PhotoUploaderProps {
  /** Photo keys in display order. The first one is the cover. */
  value: string[];
  onChange: (keys: string[]) => void;
  /** The form's own message, e.g. "Add at least one photo." */
  error?: string;
  max?: number;
  idPrefix?: string;
}

interface Problem {
  name: string;
  message: string;
}

function newPhotoKey(): string {
  return `ph-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function PhotoTile({
  photoKey,
  isCover,
  index,
  total,
  onRemove,
  onMakeCover,
}: {
  photoKey: string;
  isCover: boolean;
  index: number;
  total: number;
  onRemove: (key: string) => void;
  onMakeCover: (key: string) => void;
}) {
  const url = usePhotoUrl(photoKey, "thumb");

  return (
    <li className="relative overflow-hidden rounded-md border border-line bg-surface">
      <div className="aspect-square w-full">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={isCover ? `Cover photo, ${index + 1} of ${total}` : `Photo ${index + 1} of ${total}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-black/40">
            <CameraIcon size={20} />
            <span className="font-sans text-[10px] uppercase tracking-wide">
              No preview
            </span>
          </div>
        )}
      </div>

      {isCover && (
        <span className="absolute left-1 top-1 rounded-sm bg-primary px-1.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-white">
          Cover
        </span>
      )}

      <div className="absolute bottom-0 right-0 flex">
        {!isCover && (
          <button
            type="button"
            onClick={() => onMakeCover(photoKey)}
            aria-label={`Make photo ${index + 1} the cover`}
            className="flex h-11 w-11 items-center justify-center bg-white/85 text-black hover:bg-white"
          >
            <CameraIcon size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(photoKey)}
          aria-label={`Remove photo ${index + 1}`}
          className="flex h-11 w-11 items-center justify-center bg-white/85 text-black hover:bg-white"
        >
          <TrashIcon size={18} />
        </button>
      </div>
    </li>
  );
}

export default function PhotoUploader({
  value,
  onChange,
  error,
  max = MAX_PHOTOS,
  idPrefix = "photo",
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // The keys the listing already had when this form opened. See `remove`.
  const originalKeys = useRef<Set<string>>(new Set(value));
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [storageWarning, setStorageWarning] = useState("");

  const remaining = Math.max(0, max - value.length);

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;

    const room = Math.min(files.length, remaining);
    const skipped = files.length - room;
    const acceptedKeys: string[] = [];
    const found: Problem[] = [];

    setProblems([]);
    setStorageWarning("");
    setProgress({ done: 0, total: room });

    for (let i = 0; i < room; i += 1) {
      const file = files[i];
      const result = await encodePhoto(file);
      if (result.ok) {
        const key = newPhotoKey();
        const written = await putPhoto({
          key,
          full: result.full,
          thumb: result.thumb,
          addedAt: new Date().toISOString(),
          originalBytes: result.originalBytes,
          width: result.width,
          height: result.height,
        });
        // A photo that could not be stored cannot be shown later, so it is not
        // handed to the listing. Saying so beats a tile that lies.
        if (written.ok) {
          acceptedKeys.push(key);
        } else {
          setStorageWarning(written.message);
        }
      } else {
        found.push({ name: file.name, message: result.message });
      }
      setProgress({ done: i + 1, total: room });
    }

    setProgress(null);
    setProblems(found);
    if (acceptedKeys.length > 0) onChange([...value, ...acceptedKeys]);

    if (skipped > 0) {
      setProblems((prev) => [
        {
          name: "",
          message: `${skipped} more photo${skipped === 1 ? "" : "s"} not added — a listing takes ${max}.`,
        },
        ...prev,
      ]);
    }
  }

  function remove(key: string) {
    // Free the bytes immediately for a photo this session added: the seller just
    // pressed remove, so keeping it is a pure leak.
    //
    // A key the saved listing already had is different. That record still points
    // at the blob until the seller saves, so deleting now would leave an ad that
    // was never edited showing "photo unavailable" forever. Those are left for
    // the sweep on My ads, which only ever drops keys no listing references.
    if (!originalKeys.current.has(key)) void deletePhotos([key]);
    // Removing a photo is a new decision; a stale "2 more photos not added"
    // warning next to an empty grid just misinforms.
    setProblems([]);
    onChange(value.filter((k) => k !== key));
  }

  function makeCover(key: string) {
    onChange([key, ...value.filter((k) => k !== key)]);
  }

  const inputId = `${idPrefix}-input`;
  const labelId = `${idPrefix}-label`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span
          id={labelId}
          className="font-sans text-sm font-bold uppercase tracking-wide"
        >
          Photos <span aria-hidden="true">*</span>
        </span>
        <span className="font-sans text-xs text-black/45">
          {value.length} of {max}
        </span>
      </div>

      <p className="font-sans text-xs text-black/60">
        Photos are resized to {MAX_EDGE}px on the long edge and kept on this
        device only. Re-encoding removes the camera data a phone embeds, including
        the location tag, before a buyer ever sees the picture.
      </p>

      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((key, index) => (
          <PhotoTile
            key={key}
            photoKey={key}
            index={index}
            total={value.length}
            isCover={index === 0}
            onRemove={remove}
            onMakeCover={makeCover}
          />
        ))}

        {remaining > 0 && (
          <li>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              aria-labelledby={labelId}
              onChange={(e) => void handleFiles(e.target.files)}
            />
            <label
              htmlFor={inputId}
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line bg-white text-black/60 hover:border-primary focus-within:border-primary"
            >
              <CameraIcon size={22} />
              <span className="font-sans text-[11px] font-bold uppercase tracking-wide">
                Add photo
              </span>
            </label>
          </li>
        )}
      </ul>

      {progress && (
        <p role="status" className="font-sans text-sm">
          Preparing photo {progress.done} of {progress.total}…
        </p>
      )}

      {storageWarning && (
        <p role="alert" className="font-sans text-sm font-bold">
          {storageWarning}
        </p>
      )}

      {problems.map((problem, index) => (
        <p
          key={`${problem.name}-${index}`}
          role="alert"
          className="font-sans text-sm font-bold"
        >
          {problem.name ? `${problem.name}: ` : ""}
          {problem.message}
        </p>
      ))}

      {error && (
        <p
          id={`${idPrefix}-error`}
          role="alert"
          className="font-sans text-sm font-bold"
        >
          {error}
        </p>
      )}

      {value.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            padding="tight"
            shape="pill"
            onClick={() => inputRef.current?.click()}
          >
            Add more
          </Button>
        </div>
      )}
    </div>
  );
}
