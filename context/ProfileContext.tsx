"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Profile {
  firstName: string;
  lastName: string;
  /** How the store greets you. Falls back to the first name when blank. */
  username: string;
  email: string;
  phone: string;
  /** `yyyy-mm-dd`, or "" when not given. */
  dateOfBirth: string;
  /**
   * A data URL read from a file chosen on this device. It is written straight
   * into localStorage, so it never leaves the browser and no server ever sees
   * an image.
   */
  photoDataUrl?: string;
  /** Set by saveProfile. Its presence is what marks a profile as filled in. */
  updatedAt?: string;
}

export const emptyProfile: Profile = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  dateOfBirth: "",
};

/**
 * A phone-camera photo is several megabytes once base64'd, and localStorage's
 * budget is roughly 5MB for the whole origin - shared with the cart, saved
 * items and orders. Anything larger is refused with a message rather than
 * silently evicting the other stores.
 */
export const MAX_PHOTO_BYTES = 350 * 1024;

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: "photo-too-large" | "storage-full" };

interface ProfileContextValue {
  profile: Profile;
  hydrated: boolean;
  /** True once the visitor has saved the form at least once. */
  hasProfile: boolean;
  saveProfile: (next: Profile) => SaveResult;
  clearProfile: () => void;
}

const STORAGE_KEY = "ocnoo-profile";
const ProfileContext = createContext<ProfileContextValue | null>(null);

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function read(): Profile {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProfile;
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return emptyProfile;
    return {
      firstName: str(parsed.firstName),
      lastName: str(parsed.lastName),
      username: str(parsed.username),
      email: str(parsed.email),
      phone: str(parsed.phone),
      dateOfBirth: str(parsed.dateOfBirth),
      photoDataUrl:
        typeof parsed.photoDataUrl === "string" &&
        parsed.photoDataUrl.startsWith("data:image/")
          ? parsed.photoDataUrl
          : undefined,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    };
  } catch {
    return emptyProfile;
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(read());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Profile): SaveResult => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setProfile(next);
      return { ok: true };
    } catch {
      // Quota is the only realistic failure, and a too-large photo is the only
      // realistic cause. Say which, so the fix is obvious.
      if (next.photoDataUrl && next.photoDataUrl.length > MAX_PHOTO_BYTES * 1.4) {
        return { ok: false, reason: "photo-too-large" };
      }
      return { ok: false, reason: "storage-full" };
    }
  }, []);

  const saveProfile = useCallback(
    (next: Profile) => persist({ ...next, updatedAt: new Date().toISOString() }),
    [persist]
  );

  const clearProfile = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clear if storage is unavailable */
    }
    setProfile(emptyProfile);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      hydrated,
      hasProfile: Boolean(profile.updatedAt),
      saveProfile,
      clearProfile,
    }),
    [profile, hydrated, saveProfile, clearProfile]
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}

/** Name to greet the visitor with, working down from what they filled in. */
export function displayName(profile: Profile): string {
  const full = `${profile.firstName} ${profile.lastName}`.trim();
  return profile.username.trim() || full || "Guest";
}
