"use client";

import { useAddresses } from "@/context/AddressesContext";
import AccountShell from "@/components/account/AccountShell";
import AddressForm from "@/components/account/AddressForm";

export default function NewAddressPage() {
  const { addresses, hydrated, addAddress, setDefault } = useAddresses();

  if (!hydrated) {
    return (
      <AccountShell>
        <p className="font-sans text-sm text-black/55">Loading…</p>
      </AccountShell>
    );
  }

  return (
    <AccountShell>
      <h1 className="mb-1 font-sans text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        Add a New Address
      </h1>
      <p className="mb-6 font-sans text-sm text-black/60">
        Everything here is required except the landmark.
      </p>

      <AddressForm
        canBecomeDefault={addresses.length > 0}
        initiallyDefault={addresses.length === 0}
        onSave={(draft, asDefault) => {
          const created = addAddress(draft);
          if (!created) return false;
          if (asDefault) setDefault(created.id);
          return true;
        }}
      />
    </AccountShell>
  );
}
