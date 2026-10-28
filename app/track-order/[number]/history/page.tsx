import Link from "next/link";
import { getOrderByToken } from "@/lib/orders";
import type { Order } from "@/lib/orders";
import { LADDER, longDate, PAYMENT_LABEL, paymentNote, statusNote, stepIndex } from "@/lib/orderStatus";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ContactMenu from "@/components/layout/ContactMenu";
import { ArrowLeftIcon } from "@/components/ui/icons";

// Same rule as the detail screen: read with the link's token, per request.
export const dynamic = "force-dynamic";

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
function buildNodes(order: Order): Node[] {
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

export default async function PackageHistoryPage({
  params,
  searchParams,
}: {
  params: { number: string };
  searchParams: { t?: string };
}) {
  const number = decodeURIComponent(params.number).trim();
  const token = (searchParams.t ?? "").trim();
  const order = token ? await getOrderByToken(number, token) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-in px-4 pb-8 pt-3 md:py-8">
        <h1 className="sr-only font-sans text-3xl font-extrabold uppercase tracking-tight md:not-sr-only">
          Package history
        </h1>
        <Card bordered className="flex flex-col gap-4 p-6">
          <p className="font-sans text-lg font-bold">
            That order could not be opened from this link.
          </p>
          <p className="font-sans text-sm leading-relaxed text-black/60">
            Tracking links carry a private key. Open the order again with your
            order number and the phone number you used at checkout.
          </p>
          <Button href="/track-order" variant="primary" className="self-start">
            Track an order
          </Button>
        </Card>
      </div>
    );
  }

  const nodes = buildNodes(order);
  const backTo = `/track-order/${encodeURIComponent(
    order.orderNumber
  )}?t=${encodeURIComponent(token)}`;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 pb-8 pt-3 md:py-8">
      <Link
        href={backTo}
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

      {/* Money is a parallel track, not a rung of the ladder. Folding it in
          above would imply the transfer has to happen between "placed" and
          "packed", which it does not - and it would steal the single "current"
          marker from the step the parcel is actually on. */}
      <Card bordered className="mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-xs uppercase tracking-wide text-black/50">
            Payment
          </p>
          <span className="rounded-full border border-line px-2.5 py-1 font-sans text-[11px] font-bold uppercase tracking-wide">
            {PAYMENT_LABEL[order.paymentStatus]}
          </span>
        </div>
        <p className="mt-2 font-sans text-sm leading-relaxed text-black/70">
          {paymentNote(order)}
        </p>
        {order.paidAt && (
          <p className="mt-1 font-sans text-xs text-black/45">
            Declared {longDate(order.paidAt)}
          </p>
        )}
      </Card>

      <p className="mt-4 font-sans text-xs leading-relaxed text-black/55">
        {statusNote(order)} There is no courier tracking number to follow — the
        steps above are the shop&apos;s own record of the order.
      </p>

      <ContactMenu variant="pill" className="mt-4" />
    </div>
  );
}
