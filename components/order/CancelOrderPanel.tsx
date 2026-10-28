"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface CancelOrderPanelProps {
  orderNumber: string;
  token: string;
  /** Already checked against the ladder by the server render. */
  canCancel: boolean;
}

/**
 * The one interactive control on the order detail screen.
 *
 * It is a client island because cancelling writes to the database; the page
 * around it is rendered on the server from the same row, so a refresh after the
 * write shows the new status without the customer reloading by hand.
 */
export default function CancelOrderPanel({
  orderNumber,
  token,
  canCancel,
}: CancelOrderPanelProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  if (!canCancel) return null;

  async function confirm() {
    if (busy) return;
    setBusy(true);
    setFailure(null);
    // Loaded on the click, not with the page: most visitors never cancel, and
    // the Supabase client is the single largest dependency this screen could
    // otherwise carry.
    const { cancelMyOrder } = await import("@/lib/orders");
    const result = await cancelMyOrder(orderNumber, token);
    setBusy(false);
    setConfirming(false);
    if (result === "ok") {
      router.refresh();
      return;
    }
    setFailure(
      result === "too-late"
        ? "The shop has already moved this order along, so it can no longer be cancelled here."
        : "We could not find that order. Open it again from the tracking page and try once more."
    );
  }

  return (
    <>
      {!confirming && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setConfirming(true)}
        >
          Cancel this order
        </Button>
      )}

      {confirming && (
        <div
          role="group"
          aria-label="Confirm cancellation"
          className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
        >
          <p className="font-sans text-sm font-semibold">
            Cancel order {orderNumber}?
          </p>
          <p className="font-sans text-xs leading-relaxed text-black/60">
            No payment was taken, so there is nothing to refund. This cannot be
            undone — you would need to place the order again.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="min-w-0 flex-1"
              onClick={() => setConfirming(false)}
            >
              Keep order
            </Button>
            <Button
              variant="primary"
              className="min-w-0 flex-1"
              disabled={busy}
              onClick={() => void confirm()}
            >
              {busy ? "Cancelling…" : "Yes, cancel it"}
            </Button>
          </div>
        </div>
      )}

      {failure && (
        <p role="status" className="font-sans text-sm">
          {failure}
        </p>
      )}
    </>
  );
}
