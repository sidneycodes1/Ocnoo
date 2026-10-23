"use client";

import Link from "next/link";
import { useAddresses } from "@/context/AddressesContext";
import AccountShell from "@/components/account/AccountShell";
import AddressRow from "@/components/account/AddressRow";
import Button from "@/components/ui/Button";

export default function AddressBookPage() {
  const {
    addresses,
    hydrated,
    removeAddress,
    setDefault,
  } = useAddresses();

  return (
    <AccountShell>
      <h1 className="mb-1 font-sans text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
        Address Book
      </h1>
      <p className="mb-6 font-sans text-sm text-black/60">
        Where your orders get delivered. Saved in this browser only.
      </p>

      {!hydrated ? (
        <p className="font-sans text-sm text-black/55">Loading your addresses…</p>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-xl border border-line bg-surface p-4 font-sans text-sm leading-relaxed">
            No addresses saved yet. Checkout will ask for the delivery details on
            every order until you add one here — then it fills itself in from the
            address marked Default.
          </p>
          <Button href="/account/addresses/new" variant="primary" className="self-start">
            Add a New Address
          </Button>
        </div>
      ) : (
        <>
          {/* Each AddressRow titles itself with <h3>; this keeps the outline at
              h1 -> h2 -> h3. Inside the branch that renders the rows, so it
              never heads an empty list. */}
          <h2 className="sr-only">Saved addresses</h2>
          <ul className="flex flex-col gap-4">
            {addresses.map((a) => (
              <li key={a.id}>
                <AddressRow
                  address={a}
                  onMakeDefault={setDefault}
                  onRemove={removeAddress}
                />
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/account/addresses/new"
              className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
            >
              Add another address
            </Link>
          </div>
        </>
      )}
    </AccountShell>
  );
}
