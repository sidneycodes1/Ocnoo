"use client";

import Link from "next/link";
import { displayName, useProfile } from "@/context/ProfileContext";
import Avatar from "@/components/ui/Avatar";
import { PencilIcon } from "@/components/ui/icons";

/** Long, human date. `Intl` rather than a hand-rolled month table. */
function lastSaved(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * The identity the visitor saved on the Edit Profile screen. This is the proof
 * that saving worked: what you typed is what appears here, and it is the only
 * place the profile is summarised. Nothing is invented when there is no profile
 * yet - the card says so and offers the way to the form.
 */
export default function ProfileCard({ className = "" }: { className?: string }) {
  const { profile, hydrated, hasProfile } = useProfile();

  if (!hydrated) {
    return (
      <div
        className={
          "rounded-xl border border-line bg-white p-4 md:p-5 " + className
        }
      >
        <p className="font-sans text-sm text-black/55">Loading your details…</p>
      </div>
    );
  }

  const name = displayName(profile);
  const updated = profile.updatedAt ? lastSaved(profile.updatedAt) : "";

  return (
    <section
      aria-label="Your profile"
      className={
        "flex items-center gap-4 rounded-xl border border-line bg-white p-4 md:p-5 " +
        className
      }
    >
      <Avatar profile={profile} size={72} />

      <div className="min-w-0 flex-1">
        <h2 className="truncate font-sans text-lg font-extrabold md:text-xl">
          {name}
        </h2>

        {hasProfile ? (
          <div className="mt-0.5 flex flex-col gap-0.5 font-sans text-sm text-black/60">
            <p className="truncate">{profile.email || "No email added"}</p>
            {profile.phone ? (
              <p className="truncate">{profile.phone}</p>
            ) : (
              <p className="truncate text-black/45">No phone added</p>
            )}
            {updated && (
              <p className="truncate text-xs text-black/45">Saved {updated}</p>
            )}
          </div>
        ) : (
          <p className="mt-0.5 font-sans text-sm text-black/55">
            You are browsing as a guest — this demo has no sign-in. Add your
            details once and checkout fills itself in.
          </p>
        )}
      </div>

      <Link
        href="/account/edit-profile"
        className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl border border-line bg-white px-3 font-sans text-sm font-semibold active:bg-page md:hover:bg-page"
      >
        <PencilIcon size={16} className="text-black/55" />
        <span className="sr-only md:not-sr-only">Edit</span>
      </Link>
    </section>
  );
}
