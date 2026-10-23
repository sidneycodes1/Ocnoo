"use client";

import type { ReactNode } from "react";

/**
 * The label + error pair every field in this app uses, extracted from the
 * address form so the listing form does not grow a fourth copy of it.
 *
 * Two things here are load-bearing rather than stylistic:
 *  - The three attributes that make an error reachable: `id` (which the label
 *    points at), `aria-invalid`, and `aria-describedby` onto the message.
 *  - The message is bold ink, never red. `danger` is a fill token on this site;
 *    as 14px text on the card tone it falls under WCAG AA, and a form that
 *    reports errors only in colour fails the one test that matters.
 */

export function fieldAria(
  id: string,
  invalid: boolean,
): { "aria-invalid"?: true; "aria-describedby"?: string } {
  return invalid
    ? { "aria-invalid": true, "aria-describedby": `${id}-error` }
    : {};
}

/**
 * Drop one field's error when the seller fixes it, leaving the others alone so a
 * second submit still reports what is still wrong.
 *
 * Deleting the key rather than setting it to `undefined` is the point. Spreading
 * `{ [key]: undefined }` keeps the key, so `Object.keys(errors).length` never
 * falls back to zero and the "Check the highlighted fields." summary stays on
 * screen after every visible error has gone.
 */
export function withoutError<T extends object>(errors: T, key: keyof T): T {
  if (!errors[key]) return errors;
  const next = { ...errors };
  delete next[key];
  return next;
}

interface LabelledProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  /** Marks a required field. `aria-hidden`, so a screen reader is not reading "star". */
  required?: boolean;
  children: ReactNode;
}

export function Labelled({
  label,
  error,
  htmlFor,
  className = "",
  required = false,
  children,
}: LabelledProps) {
  return (
    <label htmlFor={htmlFor} className={`flex flex-col gap-1 ${className}`}>
      <span className="font-sans text-sm font-bold uppercase tracking-wide">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children}
      {error && (
        <span id={`${htmlFor}-error`} className="font-sans text-sm font-bold">
          {error}
        </span>
      )}
    </label>
  );
}
