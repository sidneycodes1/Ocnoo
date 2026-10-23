"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MAX_PHOTO_BYTES,
  emptyProfile,
  useProfile,
  type Profile,
} from "@/context/ProfileContext";
import Avatar from "@/components/ui/Avatar";
import AccountShell from "@/components/account/AccountShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";

interface FieldSpec {
  key: "firstName" | "lastName" | "username" | "email" | "phone" | "dateOfBirth";
  label: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}

const FIELDS: FieldSpec[] = [
  { key: "firstName", label: "First name", autoComplete: "given-name" },
  { key: "lastName", label: "Last name", autoComplete: "family-name" },
  { key: "username", label: "Display name", placeholder: "How we greet you" },
  {
    key: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
    placeholder: "you@example.com",
  },
  { key: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "0803 000 0000" },
  { key: "dateOfBirth", label: "Date of birth", type: "date" },
];

/**
 * One field, two shapes from the same markup:
 *
 * - Mobile is the reference Edit Profile row: muted label on the left, the
 *   value written flush right with no box around it, hairlines between rows.
 * - At md it becomes the reference "Account Information" field: bold uppercase
 *   label above a bordered input.
 *
 * `flex-wrap` lets the error message drop onto its own full-width line instead
 * of squeezing in beside the input.
 */
function Field({
  spec,
  value,
  error,
  onChange,
  last,
}: {
  spec: FieldSpec;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  last: boolean;
}) {
  const id = `profile-${spec.key}`;

  return (
    <div
      className={
        "flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 " +
        (last ? "" : "border-b border-line ") +
        "md:block md:border-0 md:p-0"
      }
    >
      <label
        htmlFor={id}
        className="w-[7.5rem] shrink-0 font-sans text-sm text-black/55 md:mb-1 md:block md:w-auto md:text-sm md:font-bold md:uppercase md:tracking-wide md:text-black"
      >
        {spec.label}
      </label>
      <div className="min-w-0 flex-1 md:w-full">
        <Input
          id={id}
          type={spec.type ?? "text"}
          value={value}
          autoComplete={spec.autoComplete}
          placeholder={spec.placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={
            "border-0 bg-transparent px-0 text-right font-sans md:border md:border-line md:bg-white md:px-3 md:text-left"
          }
        />
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="w-full pl-[8.25rem] font-sans text-sm font-bold md:pl-0"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function EditProfilePage() {
  const { profile, hydrated, saveProfile, clearProfile } = useProfile();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const seeded = useRef(false);

  const [form, setForm] = useState<Profile>(emptyProfile);
  const [errors, setErrors] = useState<Partial<Record<FieldSpec["key"], string>>>({});
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Seed the form from storage exactly once. Re-seeding whenever `profile`
  // changes would overwrite what the visitor is typing.
  useEffect(() => {
    if (!hydrated || seeded.current) return;
    seeded.current = true;
    setForm(profile);
  }, [hydrated, profile]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center font-sans">
        Loading your profile…
      </div>
    );
  }

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    // Reset so choosing the same file again after a removal still fires.
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("That file is not an image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. Choose one under ${
          Math.round(MAX_PHOTO_BYTES / 1024
        )}KB — it is stored in this browser, not uploaded.`
      );
      return;
    }
    setPhotoError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") set("photoDataUrl", reader.result);
    };
    reader.onerror = () => setPhotoError("The file could not be read.");
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const next: Partial<Record<FieldSpec["key"], string>> = {};
    if (!form.firstName.trim()) next.firstName = "Required field.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "That does not look like an email address.";
    }
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      if (Number.isNaN(dob.getTime()) || dob > new Date()) {
        next.dateOfBirth = "Pick a date in the past.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const result = saveProfile({
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      username: form.username.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    if (!result.ok) {
      setPhotoError(
        result.reason === "photo-too-large"
          ? "The photo is too large to store in this browser. Pick a smaller one."
          : "This browser refused to save the change — its storage may be full."
      );
      return;
    }
    // Straight back to the profile, which is the proof that it worked.
    router.push("/account");
  }

  return (
    <AccountShell>
      <h1 className="mb-1 font-sans text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        Account Information
      </h1>
      <p className="mb-6 font-sans text-sm text-black/60">
        Saved in this browser only. Nothing is uploaded, and this demo has no
        sign-in.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-6">
        <Card bordered className="flex flex-col items-center gap-3 p-6">
          <div className="relative">
            <Avatar profile={form} size={96} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              aria-label="Choose a profile photo from this device"
              className="absolute bottom-0 right-0 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-soft active:scale-95 motion-safe:transition-transform motion-safe:duration-150"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickPhoto}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          <p className="max-w-[38ch] text-center font-sans text-xs leading-relaxed text-black/55">
            The picture is kept in this browser as part of your saved profile. It
            is never uploaded anywhere.
          </p>
          {form.photoDataUrl && (
            <button
              type="button"
              onClick={() => {
                set("photoDataUrl", undefined);
                setPhotoError(null);
              }}
              className="min-h-[44px] font-sans text-sm font-semibold underline underline-offset-4"
            >
              Remove photo
            </button>
          )}
          {photoError && (
            <p role="status" className="font-sans text-sm font-bold">
              {photoError}
            </p>
          )}
        </Card>

        {/* Mobile: full-bleed hairline rows. Desktop: the bordered two-column
            card. Same fields, same state, one render. */}
        <div className="-mx-4 border-y border-line bg-white md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:rounded-xl md:border md:border-line md:p-6">
          {FIELDS.map((spec, i) => (
            <Field
              key={spec.key}
              spec={spec}
              value={form[spec.key]}
              error={errors[spec.key]}
              onChange={(v) => set(spec.key, v)}
              last={i === FIELDS.length - 1}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" variant="primary" className="w-full">
            Save changes
          </Button>
          <p aria-live="polite" className="min-h-[20px] font-sans text-sm">
            {saved ? "Saved." : ""}
          </p>

          {profile.updatedAt && !confirmReset && (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[44px] self-start font-sans text-sm text-black/55 underline underline-offset-4"
            >
              Clear my saved details
            </button>
          )}
          {confirmReset && (
            <div
              role="group"
              aria-label="Confirm clearing saved details"
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface p-4"
            >
              <p className="min-w-0 flex-1 font-sans text-sm">
                This erases the saved details and photo from this browser.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmReset(false);
                  clearProfile();
                  setForm(emptyProfile);
                  setErrors({});
                  setPhotoError(null);
                }}
              >
                Yes, clear
              </Button>
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                Keep
              </Button>
            </div>
          )}
        </div>
      </form>
    </AccountShell>
  );
}
