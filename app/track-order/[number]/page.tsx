"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrders, CANCELLABLE } from "@/context/OrdersContext";
import { formatNaira } from "@/lib/utils";
import { longDate, statusNote, totalQuantity } from "@/lib/orderStatus";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusChip from "@/components/order/StatusChip";
import ContactMenu from "@/components/layout/ContactMenu";
import { ArrowLeftIcon } from "@/components/ui/icons";

function NotFound({ number }: { number: string }) {
  return (
    <Card bordered className="flex flex-col gap-4 p-6">
      <p className="font-sans text-lg font-bold">
        We can&apos;t find {number || "that order"} on this device.
      </p>
      <p className="font-sans text-sm leading-relaxed text-black/60">
        Orders are saved in the browser they were placed in, and this demo has no
        account system that could carry them across devices. If you placed it
        somewhere else, it will not appear here.
      </p>
      <Button href="/track-order" variant="primary" className="self-start">
        Back to your orders
      </Button>
    </Card>
  );
}

export default function OrderDetailPage({ params }: { params: { number: string } }) {
  const { orders, hydrated, cancelOrder } = useOrders();
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center font-sans">
        Loading your order…
      </div>
    );
  }

  const wanted = decodeURIComponent(params.number).trim().toLowerCase();
  const order = orders.find((o) => o.orderNumber.toLowerCase() === wanted);
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-in px-4 pb-8 pt-3 md:py-8">
        <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only">
          Order details
        </h1>
        <NotFound number={params.number} />
      </div>
    );
  }

  const canCancel = CANCELLABLE.includes(order.status);
  const qty = totalQuantity(order);

  // Hoisted function declarations do not inherit control-flow narrowing from
  // the guard above, so the number is copied out while `order` is definite.
  const orderNumber = order.orderNumber;

  function onConfirmCancel() {
    if (!cancelOrder(orderNumber)) setFailed(true);
    setConfirming(false);
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 pb-8 pt-3 md:py-8">
      {/* Desktop only — below md the screen header carries the back arrow. */}
      <Link
        href="/track-order"
        className="mb-4 hidden min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-wide hover:underline hover:underline-offset-4 md:inline-flex"
      >
        <ArrowLeftIcon size={16} />
        Your orders
      </Link>

      <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only">
        Order {order.orderNumber}
      </h1>

      <div className="flex flex-col gap-5">
        <Card bordered className="flex flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-sans text-xs uppercase tracking-wide text-black/50">
                Order number
              </p>
              <p className="font-mono text-xl font-bold">{order.orderNumber}</p>
            </div>
            <StatusChip status={order.status} />
          </div>
          <p className="font-sans text-sm text-black/60">
            {qty} item{qty === 1 ? "" : "s"} · Placed{" "}
            {longDate(order.createdAt)} ·{" "}
            {order.payment === "paystack" ? "Card (Paystack)" : "Bank transfer"}
          </p>
          <p className="font-sans text-sm leading-relaxed">{statusNote(order)}</p>
          <p className="font-sans text-xs text-black/50">
            This demo records the order on your device and takes no payment, so
            the status does not advance on its own.
          </p>
        </Card>

        <section>
          <h2 className="mb-2 font-sans text-sm font-bold uppercase tracking-wide">
            Items in your order
          </h2>
          <Card bordered className="divide-y divide-line">
            <ul>
              {order.lines.map((l, i) => (
                <li key={i} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold leading-snug">
                      {l.name}
                    </p>
                    <p className="mt-1 font-sans text-xs text-black/50">
                      Qty {l.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm">
                    {formatNaira(l.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
            <dl className="flex flex-col gap-1 p-4 font-sans text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-black/60">Subtotal</dt>
                <dd className="font-mono">{formatNaira(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-black/60">
                  Delivery · zone {order.zone}
                </dt>
                <dd className="font-mono">{formatNaira(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-base font-bold">
                <dt>Total</dt>
                <dd className="font-mono">{formatNaira(order.total)}</dd>
              </div>
            </dl>
          </Card>
        </section>

        <section>
          <h2 className="mb-2 font-sans text-sm font-bold uppercase tracking-wide">
            Delivery details
          </h2>
          <Card bordered className="p-4">
            <p className="font-sans text-sm font-semibold">{order.delivery.name}</p>
            <p className="mt-1 font-sans text-sm">{order.delivery.address}</p>
            <p className="font-sans text-sm text-black/60">
              {order.delivery.state}
            </p>
            <p className="mt-2 font-mono text-sm">{order.delivery.phone}</p>
          </Card>
        </section>

        <div className="flex flex-col gap-3">
          <Button
            href={`/track-order/${encodeURIComponent(orderNumber)}/history`}
            variant="primary"
            className="w-full"
          >
            Package history
          </Button>

          {canCancel && !confirming && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setConfirming(true)}
            >
              Cancel this order
            </Button>
          )}

          {canCancel && confirming && (
            <div
              role="group"
              aria-label="Confirm cancellation"
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4"
            >
              <p className="font-sans text-sm font-semibold">
                Cancel order {order.orderNumber}?
              </p>
              <p className="font-sans text-xs leading-relaxed text-black/60">
                Nothing was charged, so there is nothing to refund. This cannot be
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
                  onClick={onConfirmCancel}
                >
                  Yes, cancel it
                </Button>
              </div>
            </div>
          )}

          {failed && (
            <p role="status" className="font-sans text-sm">
              That order has moved on and can no longer be cancelled here.
            </p>
          )}

          {!canCancel && (
            <p className="font-sans text-xs leading-relaxed text-black/50">
              {order.status === "cancelled"
                ? "This order is cancelled."
                : "This order is too far along to cancel from here."}
            </p>
          )}

          <ContactMenu variant="pill" className="self-start" />
        </div>
      </div>
    </div>
  );
}
