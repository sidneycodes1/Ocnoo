"use client";

import { useState } from "react";
import Link from "next/link";
import { formatAddress, type Address } from "@/context/AddressesContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { CheckIcon, PencilIcon, TrashIcon } from "@/components/ui/icons";

interface AddressRowProps {
  address: Address;
  onMakeDefault: (id: string) => void;
  onRemove: (id: string) => void;
}

/**
 * One saved address. Reading order is what the list is for: whose door, how to
 * call them, where it is. The actions sit on a rule at the bottom so they never
 * look like part of the address itself.
 *
 * Delete is destructive and unrecoverable (there is no server to restore from),
 * so it asks first instead of removing on the first tap.
 */
export default function AddressRow({
  address,
  onMakeDefault,
  onRemove,
}: AddressRowProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <Card bordered className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-sans text-sm font-extrabold uppercase tracking-wide">
          {address.label}
        </h3>
        {address.isDefault && (
          <Badge className="bg-accent text-black">Default</Badge>
        )}
      </div>

      <address className="flex flex-col gap-0.5 font-sans text-sm not-italic">
        <span className="font-bold">{address.recipientName}</span>
        <span className="font-mono text-black/70">{address.phone}</span>
        <span className="text-black/70">{formatAddress(address)}</span>
        {address.landmark && (
          <span className="text-xs text-black/55">{address.landmark}</span>
        )}
      </address>

      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-3">
          <p className="min-w-0 flex-1 font-sans text-sm">
            Delete this address from this browser?
          </p>
          <Button
            variant="secondary"
            padding="tight"
            className="min-h-[44px]"
            onClick={() => setConfirming(false)}
          >
            Keep
          </Button>
          <Button
            variant="primary"
            padding="tight"
            className="min-h-[44px]"
            onClick={() => onRemove(address.id)}
          >
            Delete
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3">
          <Link
            href={`/account/addresses/${address.id}`}
            className="inline-flex min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
          >
            <PencilIcon size={16} />
            Edit
          </Link>

          {!address.isDefault && (
            <button
              type="button"
              onClick={() => onMakeDefault(address.id)}
              className="inline-flex min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
            >
              <CheckIcon size={16} />
              Make default
            </button>
          )}

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="ml-auto inline-flex min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-wide text-black/60 underline decoration-line underline-offset-4 hover:text-black"
          >
            <TrashIcon size={16} />
            Delete
          </button>
        </div>
      )}
    </Card>
  );
}
