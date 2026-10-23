/**
 * Blob storage for listing photos.
 *
 * WHY INDEXEDDB AND NOT localStorage
 * The five text stores on this origin (cart, saved, orders, profile, addresses,
 * connections) are all tiny, and localStorage suits them. Photos do not fit that
 * model twice over: the quota is 5 MB PER ORIGIN shared by all of it, and a
 * single phone photo as a base64 data URL is roughly 1.37x its binary size, so
 * one image can exceed the entire budget and throw a QuotaExceededError from
 * somewhere else in the app entirely. IndexedDB holds the bytes out-of-line,
 * without base64 inflation, and gives real per-origin quota accounting.
 *
 * Consequence for everything above this file: a listing's metadata lives in
 * localStorage and its pixels live here, addressed by key. Nothing else is
 * allowed to hold a photo, and no `data:image/...` URL may ever be written to
 * localStorage. That is what keeps the two halves from drifting apart.
 */

const DB_NAME = "ocnoo-listings";
const DB_VERSION = 1;
const STORE = "photos";

export interface PhotoRecord {
  /** The id a listing's `photoKeys` entry refers to. */
  key: string;
  full: Blob;
  thumb: Blob;
  addedAt: string;
  /**
   * What the seller's file was before re-encoding, so a tile can print
   * "1.2 MB → 180 KB" in edit mode as well as just after picking. Optional
   * because records written before it existed are still perfectly good photos.
   */
  originalBytes?: number;
  width?: number;
  height?: number;
}

export type WriteResult = { ok: true } | { ok: false; message: string };

/**
 * A message the UI can print verbatim. These are the three ways this genuinely
 * fails in the wild, and each needs a different next action from the seller, so
 * they are not collapsed into "storage unavailable".
 */
const NO_IDB_MESSAGE =
  "This browser has no photo storage, so photos will not be kept between visits.";
const BLOCKED_MESSAGE =
  "The browser blocked photo storage. A private/incognito window does this — use a normal window to keep your photos.";
const FULL_MESSAGE =
  "Your browser's storage is full. Delete a listing or two, then try again.";

let dbPromise: Promise<IDBDatabase> | null = null;

export function idbSupported(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  if (!idbSupported()) {
    return Promise.reject(new Error(NO_IDB_MESSAGE));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, rejectPromise) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    // Fires only when another tab holds an older version open. Left unhandled it
    // hangs the promise forever, which would look like a frozen upload button.
    request.onblocked = () => rejectPromise(new Error(BLOCKED_MESSAGE));
    request.onerror = () => rejectPromise(new Error(BLOCKED_MESSAGE));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      // Another tab upgrading, or the OS evicting our storage: both arrive here
      // mid-session. Drop the cached handle so the next call reopens cleanly
      // instead of throwing InvalidStateError on every later request.
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };
      db.onabort = () => {
        db.close();
        dbPromise = null;
      };
      resolve(db);
    };
  }).catch((error: unknown) => {
    // A failed open must not be cached, or every later call reuses the rejection.
    dbPromise = null;
    throw error;
  });

  return dbPromise;
}

function messageFor(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "QuotaExceededError") return FULL_MESSAGE;
  if (name === "InvalidStateError" || name === "UnknownError") return BLOCKED_MESSAGE;
  return error instanceof Error && error.message ? error.message : BLOCKED_MESSAGE;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, rejectPromise) => {
    // `versionchange` on the connection aborts transactions, so a close here is
    // expected behaviour rather than a bug: surface it as the blocked message.
    const tx = db.transaction(STORE, mode);
    const request = run(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => rejectPromise(request.error);
    tx.onabort = () => rejectPromise(tx.error);
  });
}

export async function putPhoto(record: PhotoRecord): Promise<WriteResult> {
  try {
    await withStore("readwrite", (store) => store.put(record));
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

/** Resolves to null when the key is simply absent, which is not an error. */
export async function getPhoto(key: string): Promise<PhotoRecord | null> {
  try {
    const found = await withStore<PhotoRecord | undefined>("readonly", (store) =>
      store.get(key),
    );
    return found ?? null;
  } catch {
    return null;
  }
}

export async function deletePhotos(keys: string[]): Promise<WriteResult> {
  if (keys.length === 0) return { ok: true };
  try {
    await withStore("readwrite", (store) => {
      keys.forEach((key) => store.delete(key));
      // The returned request must be the transaction's last one, otherwise the
      // promise can settle before the deletes have been committed.
      return store.count();
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: messageFor(error) };
  }
}

/** Every stored key. Used by the sweep that drops photos no listing references. */
export async function listPhotoKeys(): Promise<string[]> {
  try {
    // `getAllKeys` is typed as IDBValidKey[] because IndexedDB allows numbers,
    // dates and buffers as keys. This store only ever writes string keys (the
    // `key` field of PhotoRecord), so the cast is ours to make, here, once.
    const keys = await withStore<IDBValidKey[]>("readonly", (store) =>
      store.getAllKeys(),
    );
    return keys.filter((key): key is string => typeof key === "string");
  } catch {
    return [];
  }
}

/** Space the origin actually has, for the "storage is getting tight" warning. */
export async function storageEstimate(): Promise<{
  usage: number;
  quota: number;
} | null> {
  try {
    if (!navigator.storage?.estimate) return null;
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota };
  } catch {
    return null;
  }
}

/**
 * Ask for the larger quota. Without this, a mobile browser may cap us at a few
 * tens of MB and evict us under pressure; with it, the OS treats eight 1280px
 * photos per listing as a deliberate request rather than a surprise.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/**
 * Delete every stored photo whose key is not in `referenced`.
 *
 * Photos are written before the listing that uses them (the seller adds a photo,
 * then types a title, then maybe closes the tab). Without a sweep, every
 * abandoned draft leaks its pixels forever. This is that sweep, and it is safe by
 * construction: it only ever removes keys no surviving listing mentions.
 */
export async function sweepOrphanPhotos(
  referenced: Set<string>,
): Promise<{ removed: number; failed: string[] }> {
  const keys = await listPhotoKeys();
  const orphans = keys.filter((key) => !referenced.has(key));
  if (orphans.length === 0) return { removed: 0, failed: [] };
  const result = await deletePhotos(orphans);
  return result.ok
    ? { removed: orphans.length, failed: [] }
    : { removed: 0, failed: orphans };
}

/**
 * Keys and their age. `getAll` is used rather than `getAllKeys` because the age
 * lives in the record; the returned Blobs are handles to stored bytes, not the
 * bytes themselves, so this does not pull every photo into memory.
 */
export async function listPhotoAges(): Promise<
  { key: string; addedAtMs: number }[]
> {
  try {
    const db = await openDb();
    const records = await new Promise<PhotoRecord[]>((resolve, rejectPromise) => {
      const tx = db.transaction(STORE, "readonly");
      const request = tx.objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result as PhotoRecord[]);
      request.onerror = () => rejectPromise(request.error);
      tx.onabort = () => rejectPromise(tx.error);
    });
    return records.map((record) => ({
      key: record.key,
      // Undated records are treated as brand new: an unknown age is not a
      // licence to delete someone's photo.
      addedAtMs: Date.parse(record.addedAt ?? "") || Date.now(),
    }));
  } catch {
    return [];
  }
}

/**
 * Reclaim photos that are unreferenced AND old, for the automatic sweep that runs
 * when the app loads.
 *
 * The age test is what makes this safe to run unprompted. A second tab holding an
 * unfinished ad has photos that are unreferenced for minutes at a time, and an
 * unqualified sweep would empty that composer's grid while the seller is typing.
 * Anything younger than `olderThanMs` is left alone, however orphaned.
 */
export async function sweepAbandonedPhotos(
  referenced: Set<string>,
  olderThanMs: number,
): Promise<number> {
  const now = Date.now();
  const ages = await listPhotoAges();
  const stale = ages
    .filter(
      (entry) =>
        !referenced.has(entry.key) && now - entry.addedAtMs > olderThanMs,
    )
    .map((entry) => entry.key);
  if (stale.length === 0) return 0;
  const result = await deletePhotos(stale);
  return result.ok ? stale.length : 0;
}
