"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAddresses, type Address, type AddressDraft } from "@/context/AddressesContext";
import AccountShell from "@/components/account/AccountShell";
import AddressForm from "@/components/account/AddressForm";

/** Stored records carry an id and a date; the form edits only the draft fields. */
function toDraft(address: Address): AddressDraft {
  const { id: _id, createdAt: _createdAt, isDefault: _isDefault, ...draft } = address;
  return draft;
}

export default function EditAddressPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { addresses, hydrated, getById, updateAddress, setDefault } = useAddresses();

  if (!hydrated) {
    return (
      <AccountShell>
        <p className="font-sans text-sm text-black/55">Loading…</p>
      </AccountShell>
    );
  }

  const address = id ? getById(id) : undefined;

  // The id came from a link that no longer resolves: a deleted address, or a
  // hand-typed URL. Say so, rather than rendering an empty form that would
  // silently create a new address.
  if (!address) {
    return (
      <AccountShell>
        <h1 className="mb-1 font-sans text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
          Address not found
        </h1>
        <p className="mb-6 rounded-xl border border-line bg-surface p-4 font-sans text-sm leading-relaxed">
          That address is not saved in this browser — it was deleted, or the link
          is not right.
        </p>
        <Link
          href="/account/addresses"
          className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
        >
          Back to Address Book
        </Link>
      </AccountShell>
    );
  }

  return (
    <AccountShell>
      <h1 className="mb-1 font-sans text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        Edit Address
      </h1>
      <p className="mb-6 font-sans text-sm text-black/60">
        Changing a saved address does not change an order already placed with it.
      </p>

      <AddressForm
        initial={toDraft(address)}
        canBecomeDefault={!address.isDefault && addresses.length > 1}
        initiallyDefault={address.isDefault}
        onSave={(draft, asDefault) => {
          const updated = updateAddress(address.id, draft);
          if (!updated) return false;
          if (asDefault) setDefault(address.id);
          return true;
        }}
      />
    </AccountShell>
  );
}
