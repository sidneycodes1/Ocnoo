"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getState, getStateByName } from "@/data/nigeria/locations";
import LocationPicker from "@/components/forms/LocationPicker";
import { Labelled, fieldAria, withoutError } from "@/components/forms/Field";
import {
  ADDRESS_LABELS,
  emptyAddressDraft,
  type AddressDraft,
} from "@/context/AddressesContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type ErrorKey = keyof AddressDraft;

const REQUIRED: ErrorKey[] = [
  "recipientName",
  "phone",
  "address",
  "city",
  "state",
  "lga",
];

interface AddressFormProps {
  /** Existing values when editing. Omitted for a new address. */
  initial?: AddressDraft;
  /** The page owns storage and the redirect. Returns false to stay put. */
  onSave: (draft: AddressDraft, asDefault: boolean) => boolean;
  /** True when another address exists that this one could displace. */
  canBecomeDefault: boolean;
  /** True when this address is (or will be) the default, so there is nothing to ask. */
  initiallyDefault: boolean;
}

/**
 * Add / edit a saved delivery address. The field list is what a rider needs to
 * find a place: whose door, how to call them, street, town, state, and an
 * optional landmark. Everything except the landmark is required, because
 * checkout cannot price or place the order without it.
 *
 * "Default" is deliberately one-way: you can move the default onto an address,
 * but never off it, because an address book with no default would leave checkout
 * guessing.
 */
export default function AddressForm({
  initial,
  onSave,
  canBecomeDefault,
  initiallyDefault,
}: AddressFormProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<AddressDraft>(initial ?? emptyAddressDraft);
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [asDefault, setAsDefault] = useState(!canBecomeDefault);

  function set<K extends ErrorKey>(key: K, value: AddressDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    // Clear only that row's error, so a second submit still reports the rest.
    setErrors((e) => withoutError(e, key));
  }

  function validate(): boolean {
    const next: Partial<Record<ErrorKey, string>> = {};
    REQUIRED.forEach((key) => {
      if (!draft[key].trim()) next[key] = "Required field.";
    });
    if (draft.phone.trim() && !/^[0-9+()\s-]{7,}$/.test(draft.phone.trim())) {
      next.phone = "Enter a phone number the rider can call.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const trimmed: AddressDraft = {
      ...draft,
      label: draft.label.trim() || "Home",
      recipientName: draft.recipientName.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      city: draft.city.trim(),
      lga: draft.lga.trim(),
      landmark: draft.landmark.trim(),
    };
    if (onSave(trimmed, initiallyDefault || asDefault)) {
      router.push("/account/addresses");
    } else {
      setErrors({ state: "That state is not in the list. Pick one." });
    }
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      {/* Reference form puts the tag first: it is how the address is recognised
          in the list, not a detail buried at the bottom. */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-sans text-sm font-bold uppercase tracking-wide">
          Address label
        </legend>
        <div className="flex flex-wrap gap-2">
          {ADDRESS_LABELS.map((name) => {
            const active = draft.label === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => set("label", name)}
                aria-pressed={active}
                className={
                  "min-h-[44px] rounded-full border px-4 font-sans text-sm font-semibold " +
                  (active
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-white text-black/70")
                }
              >
                {name}
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Mobile stacks every row; desktop becomes the reference two-column form.
          `md:grid-cols-2` with the wide fields spanning both columns. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Labelled label="Full name" htmlFor="adr-name" error={errors.recipientName}>
          <Input
            id="adr-name"
            value={draft.recipientName}
            autoComplete="name"
            placeholder="Who receives the delivery"
            onChange={(e) => set("recipientName", e.target.value)}
            {...fieldAria("adr-name", Boolean(errors.recipientName))}
          />
        </Labelled>

        <Labelled label="Phone" htmlFor="adr-phone" error={errors.phone}>
          <Input
            id="adr-phone"
            type="tel"
            inputMode="tel"
            value={draft.phone}
            autoComplete="tel"
            placeholder="e.g. 08000000000"
            onChange={(e) => set("phone", e.target.value)}
            {...fieldAria("adr-phone", Boolean(errors.phone))}
          />
        </Labelled>

        <Labelled
          label="Street address"
          htmlFor="adr-street"
          error={errors.address}
          className="md:col-span-2"
        >
          <Input
            id="adr-street"
            value={draft.address}
            autoComplete="street-address"
            placeholder="Street, house or flat number"
            onChange={(e) => set("address", e.target.value)}
            {...fieldAria("adr-street", Boolean(errors.address))}
          />
        </Labelled>

        {/* State, then the local government inside it, from the verified
            774-LGA dataset. The draft stores the state NAME — the delivery zone
            and every previously saved row are keyed on it — while the picker
            speaks in slugs, so the translation happens here and nowhere else.
            It spans both columns and lays its own pair out inside that span, so
            the two selects always sit on one row. */}
        <LocationPicker
          className="md:col-span-2"
          value={{
            stateId: getStateByName(draft.state)?.id ?? "",
            lgaId: draft.lga,
          }}
          onChange={(next) => {
            const state = next.stateId ? getState(next.stateId) : undefined;
            setDraft((d) => ({
              ...d,
              state: state?.name ?? "",
              lga: next.lgaId,
            }));
            setErrors((e) => withoutError(withoutError(e, "state"), "lga"));
          }}
          idPrefix="adr-loc"
          required
          stateError={errors.state}
          lgaError={errors.lga}
        />

        <Labelled label="Town / city" htmlFor="adr-city" error={errors.city}>
          <Input
            id="adr-city"
            value={draft.city}
            autoComplete="address-level2"
            placeholder="e.g. Ikeja"
            onChange={(e) => set("city", e.target.value)}
            {...fieldAria("adr-city", Boolean(errors.city))}
          />
        </Labelled>

        <Labelled
          label="Landmark or description (optional)"
          htmlFor="adr-landmark"
        >
          <Input
            id="adr-landmark"
            value={draft.landmark}
            placeholder="e.g. Blue gate, opposite the filling station"
            onChange={(e) => set("landmark", e.target.value)}
          />
        </Labelled>
      </div>

      {initiallyDefault ? (
        <p className="font-sans text-sm text-black/60">
          This is your default delivery address.
        </p>
      ) : canBecomeDefault ? (
        <label className="flex min-h-[44px] items-start gap-3 font-sans text-sm">
          <input
            type="checkbox"
            checked={asDefault}
            onChange={(e) => setAsDefault(e.target.checked)}
            className="mt-1 h-5 w-5 shrink-0 accent-primary"
          />
          <span>Use this as my default delivery address</span>
        </label>
      ) : (
        <p className="font-sans text-sm text-black/60">
          This will be your default delivery address.
        </p>
      )}

      {hasErrors && (
        <p role="alert" className="font-sans text-sm font-bold">
          Check the highlighted fields.
        </p>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:justify-end">
        <Button
          variant="secondary"
          className="w-full md:w-auto"
          onClick={() => router.push("/account/addresses")}
        >
          Back to Address Book
        </Button>
        <Button type="submit" variant="primary" className="w-full md:w-auto">
          Save address
        </Button>
      </div>
    </form>
  );
}
