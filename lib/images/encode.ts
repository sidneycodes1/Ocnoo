/**
 * The seller photo pipeline: a picked file becomes a smaller, metadata-free JPEG.
 *
 * WHY RE-ENCODE INSTEAD OF "UPLOAD AND STRIP TAGS"
 * A JPEG's EXIF block (camera, software, timestamp, and crucially GPS) is a
 * single APP1 segment, so the tempting implementation is to delete that segment
 * and keep the bytes. That is fragile: EXIF can also ride in APP2, in XMP, and
 * in a second APP1, and a hand-written segment walker that misses one leaks the
 * seller's home coordinates onto a public listing. Drawing the decoded pixels to
 * a canvas and re-encoding cannot leak, because the encoder writes only the
 * segments it knows how to write and pixels are all we hand it. That is the
 * entire reason for this file: the guarantee comes from the data flow, not from
 * remembering to clear a field.
 *
 * A second, quieter benefit: orientation is applied at decode time
 * (`imageOrientation: "from-image"`), so the rotation is burned into the pixels
 * and the tag that carried it no longer needs to exist. Stripping EXIF without
 * applying that tag is the classic version of this bug, where a portrait phone
 * photo silently publishes itself sideways.
 *
 * WHAT IS DELIBERATELY NOT PRESERVED
 * Transparency. Output is always JPEG, so a PNG logo flattens onto white, and a
 * first-frame-only GIF loses its animation. Product photos are the job here, and
 * one predictable output beats four formats with different failure modes.
 * The original bytes are never published either — not even when they are already
 * smaller than the re-encode, because the original is the thing carrying the GPS.
 */

/** Listings take up to this many photos; the first is the cover. */
export const MAX_PHOTOS = 8;
/** Longest edge of the published photo. 1280px is enough for a full-width card. */
export const MAX_EDGE = 1280;
/** Longest edge of the grid preview, so eight tiles do not decode 8 x 1280px. */
export const THUMB_EDGE = 256;
export const JPEG_QUALITY = 0.8;
export const THUMB_QUALITY = 0.7;
/** Refused before decoding: 25 MB is far above any phone photo that matters. */
export const MAX_INPUT_BYTES = 25 * 1024 * 1024;
/**
 * Refused after decoding, before the canvas is allocated. The pixels are the
 * risk, not the bytes: a 100-megapixel source needs ~400 MB as RGBA in the
 * canvas, which is how a browser tab dies on a mid-range Android phone.
 */
export const MAX_INPUT_PIXELS = 50_000_000;

export type SniffedFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "gif"
  | "heic"
  | "unknown";

export type RejectCode =
  | "empty"
  | "unsupported-type"
  | "heic"
  | "too-large"
  | "too-many-pixels"
  | "decode-failed"
  | "timeout"
  | "encode-failed";

export interface EncodedPhoto {
  ok: true;
  /** The published image: longest edge <= MAX_EDGE, JPEG, no EXIF. */
  full: Blob;
  /** Same pixels at THUMB_EDGE, for grids. Encoded from the decoded source. */
  thumb: Blob;
  width: number;
  height: number;
  bytes: number;
  thumbBytes: number;
  originalBytes: number;
  /** What the input actually was, by its own bytes. */
  source: SniffedFormat;
  /** Measured, not assumed: the input carried an EXIF APP1 segment. */
  inputHadExif: boolean;
  /** Measured: the output carries no EXIF APP1 segment. */
  outputHasExif: boolean;
}

export interface RejectedPhoto {
  ok: false;
  code: RejectCode;
  /** Safe to show as-is. Names the limit rather than blaming the seller. */
  message: string;
}

export type PhotoResult = EncodedPhoto | RejectedPhoto;

function reject(code: RejectCode, message: string): RejectedPhoto {
  return { ok: false, code, message };
}

function ascii(bytes: Uint8Array, at: number, text: string): boolean {
  for (let i = 0; i < text.length; i += 1) {
    if (bytes[at + i] !== text.charCodeAt(i)) return false;
  }
  return true;
}

/**
 * HEIF/HEVC still-picture brands a camera or phone writes for a single photo.
 * Deliberately excludes `avif` and `hev1`, which browsers can often decode and
 * which are not iPhone photos — mislabelling those as "unsupported HEIC" would
 * send a seller off to re-take a photo that was fine.
 */
const HEIC_BRANDS = ["heic", "heix", "heim", "heis", "hevc", "hvc1", "hvc2"];

/**
 * Identify a file by its own bytes, never by `File.type` or the filename.
 * Those are both trivially wrong in the two directions that matter: a photo
 * renamed `holiday.jpg` that is really HEIC (so it silently fails to decode),
 * and a `.exe` renamed `phone.jpg` (which must never reach a canvas as a
 * "photo"). Only the first 32 bytes can answer this, and they always answer it.
 */
export function sniffFormat(head: Uint8Array): SniffedFormat {
  if (head.length < 12) return "unknown";
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  if (
    head[0] === 0x89 &&
    head[1] === 0x50 &&
    head[2] === 0x4e &&
    head[3] === 0x47
  ) {
    return "png";
  }
  if (ascii(head, 0, "GIF8")) return "gif";
  if (ascii(head, 0, "RIFF") && ascii(head, 8, "WEBP")) return "webp";
  if (ascii(head, 4, "ftyp")) {
    const brand = String.fromCharCode(head[8], head[9], head[10], head[11]);
    if (HEIC_BRANDS.includes(brand)) return "heic";
  }
  return "unknown";
}

/**
 * Walk JPEG segments looking for an EXIF APP1. Returns false for anything that
 * is not a well-formed JPEG header, and stops at SOS because past that point
 * the bytes are scan data, not markers.
 *
 * This is used as a CHECK on our own output rather than as the stripper: the
 * stripping is done by the encoder, and this exists so a claim in a comment can
 * be replaced by a measured boolean on the actual bytes we are about to publish.
 * GPS lives inside the same APP1 block (as a sub-IFD), so "no APP1 Exif" covers
 * coordinates too.
 */
export function jpegHasExif(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return false;
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) return false; // desynced: stop rather than guess
    const marker = bytes[i + 1];
    // Standalone markers carry no length field.
    if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) return false; // scan data / end
    const size = (bytes[i + 2] << 8) | bytes[i + 3];
    if (size < 2) return false;
    if (marker === 0xe1 && ascii(bytes, i + 4, "Exif")) return true;
    i += 2 + size;
  }
  return false;
}

/**
 * Raw "Exif" + two NULs anywhere in the buffer. Independent of segment framing:
 * a file can declare a length that sends a segment walker off the rails (real
 * JPEG lengths are big-endian, and a hand-built fixture gets that wrong often),
 * yet the marker bytes are still there. Checking both means a malformed header
 * cannot be mistaken for "no metadata".
 */
export function containsExifBytes(bytes: Uint8Array): boolean {
  return asciiAtAnyOffset(bytes, "Exif\0\0");
}

function asciiAtAnyOffset(bytes: Uint8Array, text: string): boolean {
  outer: for (let i = 0; i + text.length <= bytes.length; i += 1) {
    for (let j = 0; j < text.length; j += 1) {
      if (bytes[i + j] !== text.charCodeAt(j)) continue outer;
    }
    return true;
  }
  return false;
}

/** First bytes of a blob, enough to cover a JPEG header with a big thumbnail. */
async function headOf(blob: Blob, bytes: number): Promise<Uint8Array> {
  return new Uint8Array(await blob.slice(0, bytes).arrayBuffer());
}

export function inputExifBytes(file: Blob): Promise<Uint8Array> {
  return headOf(file, 128 * 1024);
}

interface Decoded {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Releases the decoder and any object URL. Must run even on failure. */
  dispose: () => void;
}

/**
 * A decode that never settles is worse than one that fails. Measured, not
 * theorised: with the tab hidden, `HTMLImageElement.decode()` stayed pending for
 * minutes on a perfectly valid 320x200 image, which would have left a seller's
 * upload spinner running forever. Every decode is therefore bounded, and the
 * `<img>` route waits on the load EVENT, which does fire in a hidden tab.
 */
const DECODE_TIMEOUT_MS = 30_000;
/** The error text that distinguishes "still working" from "unreadable". */
const DECODE_TIMEOUT_SENTINEL = "decode-deadline-exceeded";

function withDeadline<T>(work: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, rejectPromise) => {
    const timer = setTimeout(() => rejectPromise(new Error(message)), ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        rejectPromise(error);
      },
    );
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise<HTMLImageElement>((resolve, rejectPromise) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => rejectPromise(new Error("image could not be loaded"));
    img.decoding = "async";
    img.src = url;
  });
}

/**
 * Prefer `createImageBitmap`; fall back to an `<img>` because the bitmap route
 * is absent on older Safari. `imageOrientation: "from-image"` is passed
 * explicitly: it is the modern default, but being explicit means an older engine
 * that still defaults to "none" cannot hand us an unrotated 3000x4000 image and
 * have us publish it looking sideways. Dictionary members unknown to an engine
 * are ignored, never thrown, so this is safe to always pass.
 */
async function decodeBlob(blob: Blob): Promise<Decoded> {
  return withDeadline(decodeBlobWithinDeadline(blob), DECODE_TIMEOUT_MS, DECODE_TIMEOUT_SENTINEL);
}

async function decodeBlobWithinDeadline(blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob, {
        imageOrientation: "from-image",
      } as ImageBitmapOptions);
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        dispose: () => bitmap.close?.(),
      };
    } catch {
      // Some engines reject the options object outright; retry bare, then fall
      // through to the <img> path if that fails too.
      try {
        const bitmap = await createImageBitmap(blob);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          dispose: () => bitmap.close?.(),
        };
      } catch {
        /* fall through to the <img> decoder */
      }
    }
  }

  let url = "";
  try {
    url = URL.createObjectURL(blob);
    // `onload`, not `img.decode()`: see DECODE_TIMEOUT_MS above.
    const img = await loadImage(url);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    return {
      source: img,
      width,
      height,
      dispose: () => {
        img.src = "";
        if (url) URL.revokeObjectURL(url);
      },
    };
  } catch (error) {
    if (url) URL.revokeObjectURL(url);
    throw error;
  }
}

/** Fit the longest edge to `edge`, never upscaling a smaller photo. */
export function targetSize(
  width: number,
  height: number,
  edge: number,
): { w: number; h: number } {
  const longest = Math.max(width, height);
  if (!(longest > 0)) return { w: 0, h: 0 };
  const scale = Math.min(1, edge / longest);
  return {
    w: Math.max(1, Math.round(width * scale)),
    h: Math.max(1, Math.round(height * scale)),
  };
}

function encodeCanvas(
  source: CanvasImageSource,
  w: number,
  h: number,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve, rejectPromise) => {
    let settled = false;
    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      resolve(blob);
    };
    try {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        finish(null);
        return;
      }
      // JPEG has no alpha channel. Flattening on white first means transparent
      // PNG pixels land on the card tone instead of on encoder-default black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(source, 0, 0, w, h);
      canvas.toBlob((blob) => finish(blob), "image/jpeg", quality);
    } catch {
      // Allocation failure on an enormous canvas shows up as a throw here.
      finish(null);
    }
  });
}

/**
 * The whole pipeline for one file. Never throws: every failure comes back as a
 * `RejectedPhoto` with a message the UI can print, because a throw inside a file
 * input handler tends to surface as "nothing happened", which is indistinguish-
 * able from a broken button.
 */
export async function encodePhoto(file: File | Blob): Promise<PhotoResult> {
  if (file.size === 0) return reject("empty", "That file is empty.");
  if (file.size > MAX_INPUT_BYTES) {
    return reject(
      "too-large",
      `That photo is over ${Math.round(MAX_INPUT_BYTES / (1024 * 1024))} MB. Choose a smaller one.`,
    );
  }

  const format = sniffFormat(await headOf(file, 32));
  if (format === "unknown") {
    return reject(
      "unsupported-type",
      "Only JPEG, PNG, WebP or GIF photos can be uploaded.",
    );
  }
  if (format === "heic") {
    // Named separately because it is the single most common real failure: an
    // iPhone photo that was never transcoded. Telling the seller the file is
    // "invalid" would be both wrong and useless.
    return reject(
      "heic",
      "iPhone HEIC photos can't be read by this browser. Take the photo with the Camera app, or choose a JPEG.",
    );
  }

  let decoded: Decoded;
  try {
    decoded = await decodeBlob(file);
  } catch (error) {
    // A slow device is not a damaged file, and telling the seller their photo is
    // broken when the browser merely ran out of patience sends them off to
    // re-take a picture that was fine.
    if (error instanceof Error && error.message === DECODE_TIMEOUT_SENTINEL) {
      return reject(
        "timeout",
        `That photo took longer than ${Math.round(DECODE_TIMEOUT_MS / 1000)} seconds to read. Try again, or pick a smaller photo.`,
      );
    }
    return reject(
      "decode-failed",
      "That file could not be read as a photo. It may be damaged.",
    );
  }

  try {
    const { width, height } = decoded;
    if (!(width > 0) || !(height > 0)) {
      return reject(
        "decode-failed",
        "That file could not be read as a photo. It may be damaged.",
      );
    }
    if (width * height > MAX_INPUT_PIXELS) {
      return reject(
        "too-many-pixels",
        "That photo is too large for the browser to process. Choose a smaller one.",
      );
    }

    const full = targetSize(width, height, MAX_EDGE);
    const thumb = targetSize(width, height, THUMB_EDGE);
    const fullBlob = await encodeCanvas(decoded.source, full.w, full.h, JPEG_QUALITY);
    if (!fullBlob) return reject("encode-failed", ENCODE_FAILED_MESSAGE);
    const thumbBlob = await encodeCanvas(decoded.source, thumb.w, thumb.h, THUMB_QUALITY);
    if (!thumbBlob) return reject("encode-failed", ENCODE_FAILED_MESSAGE);

    // Prove the guarantee on the bytes that are about to be published, two
    // independent ways: the segment walk, and a raw search for the marker.
    const inputHead = await inputExifBytes(file);
    const outputHead = await headOf(fullBlob, 128 * 1024);
    const inputHadExif =
      jpegHasExif(inputHead) || containsExifBytes(inputHead);
    const outputHasExif =
      jpegHasExif(outputHead) || containsExifBytes(outputHead);

    return {
      ok: true,
      full: fullBlob,
      thumb: thumbBlob,
      width: full.w,
      height: full.h,
      bytes: fullBlob.size,
      thumbBytes: thumbBlob.size,
      originalBytes: file.size,
      source: format,
      inputHadExif,
      outputHasExif,
    };
  } finally {
    decoded.dispose();
  }
}

export const ENCODE_FAILED_MESSAGE =
  "Your browser could not re-encode that photo. Try a different file.";

/** Human size for the "1.2 MB -> 180 KB" line under each tile. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(kb / 1024 < 10 ? 1 : 0)} MB`;
}
