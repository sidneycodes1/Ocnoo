"use client";

import Link from "next/link";
import { useOrders } from "@/context/OrdersContext";
import type { OrderStatus } from "@/context/OrdersContext";
import { LADDER, longDate, statusNote, stepIndex } from "@/lib/orderStatus";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ContactMenu from "@/components/layout/ContactMenu";
import { ArrowLeftIcon } from "@/components/ui/icons";

interface Node {
  label: string;
  note: string;
  date: string | null;
  state: "done" | "current" | "future";
}

/**
 * Builds the ladder for one order.
 *
 * A cancelled order stops at the rung it was on (`cancelledFrom`) and gets a
 * Cancelled node after it - the ladder is not shown as if it completed.
 *
 * Only the first rung carries a date: an order records when it was placed and,
 * if cancelled, when that happened. Dating every rung would be invention.
 */
function buildNodes(order: {
  createdAt: string;
  status: OrderStatus;
  cancelledFrom?: Exclude<OrderStatus, "cancelled">;
  cancelledAt?: string;
}): Node[] {
  const cancelled = order.status === "cancelled";
  const cut = cancelled
    ? Math.max(
        0,
        LADDER.findIndex((s) => s.key === order.cancelledFrom)
      )
    : stepIndex(order.status);

  const nodes: Node[] = LADDER.map((step, i) => ({
    label: step.label,
    note: step.note,
    date: i === 0 ? longDate(order.createdAt) : null,
    state: cancelled
      ? i <= cut
        ? "done"
        : "future"
      : i < cut
      ? "done"
      : i === cut
      ? "current"
      : "future",
  }));

  if (cancelled) {
    nodes.push({
      label: "Cancelled",
      note: "This order was cancelled. Nothing was charged.",
      date: order.cancelledAt ? longDate(order.cancelledAt) : null,
      state: "current",
    });
  }

  return nodes;
}

export default function PackageHistoryPage({
  params,
}: {
  params: { number: string };
}) {
  const { orders, hydrated } = useOrders();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center font-sans">
        Loading…
      </div>
    );
  }

  const wanted = decodeURIComponent(params.number).trim().toLowerCase();
  const order = orders.find((o) => o.orderNumber.toLowerCase() === wanted);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-in px-4 pb-8 pt-3 md:py-8">
        <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only">
          Package history
        </h1>
        <Card bordered className="flex flex-col gap-4 p-6">
          <p className="font-sans text-lg font-bold">
            That order is not saved on this device.
          </p>
          <Button href="/track-order" variant="primary" className="self-start">
            Back to your orders
          </Button>
        </Card>
      </div>
    );
  }

  const nodes = buildNodes(order);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 pb-8 pt-3 md:py-8">
      <Link
        href={`/track-order/${encodeURIComponent(order.orderNumber)}`}
        className="mb-4 hidden min-h-[44px] items-center gap-1.5 font-sans text-sm font-bold uppercase tracking-wide hover:underline hover:underline-offset-4 md:inline-flex"
      >
        <ArrowLeftIcon size={16} />
        Order {order.orderNumber}
      </Link>

      <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only">
        Package History — {order.orderNumber}
      </h1>

      <Card bordered className="p-5">
        <p className="font-sans text-xs uppercase tracking-wide text-black/50">
          Order
        </p>
        <p className="mb-5 font-mono text-lg font-bold">{order.orderNumber}</p>

        <ol>
          {nodes.map((node, i) => {
            const last = i === nodes.length - 1;
            return (
              <li key={node.label} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className={
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold " +
                      (node.state === "future"
                        ? "border border-line bg-white text-black/30"
                        : node.state === "current"
                        ? "border-2 border-primary bg-white text-primary ring-4 ring-primary/15"
                        : "bg-primary text-white")
                    }
                  >
                    {node.state === "done" ? "✓" : node.state === "current" ? "●" : ""}
                  </span>
                  {!last && (
                    <span
                      aria-hidden="true"
                      className={
                        "my-1 w-0.5 flex-1 " +
                        (node.state === "done" ? "bg-primary/30" : "bg-line")
                      }
                    />
                  )}
                </div>

                <div className={last ? "pb-1" : "pb-6"}>
                  <span className="inline-block rounded-md bg-surface px-2 py-1 font-sans text-[11px] font-bold uppercase tracking-wide text-black">
                    {node.label}
                  </span>
                  {node.date && (
                    <p className="mt-2 font-sans text-xs text-black/55">
                      {node.date}
                    </p>
                  )}
                  {node.state === "current" && (
                    <p className="mt-2 max-w-[46ch] font-sans text-sm leading-relaxed">
                      {node.note}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <p className="mt-4 font-sans text-xs leading-relaxed text-black/55">
        {statusNote(order)} There is no courier tracking number to follow — this
        demo records the order on your device only.
      </p>

      <ContactMenu variant="pill" className="mt-4" />
    </div>
  );
}
