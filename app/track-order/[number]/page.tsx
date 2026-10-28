import Link from "next/link";
import { canCustomerCancel, getOrderByToken } from "@/lib/orders";
import { formatNaira } from "@/lib/utils";
import { longDate, PAYMENT_LABEL, paymentNote, statusNote, totalQuantity } from "@/lib/orderStatus";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusChip from "@/components/order/StatusChip";
import CancelOrderPanel from "@/components/order/CancelOrderPanel";
import ContactMenu from "@/components/layout/ContactMenu";
import { ArrowLeftIcon } from "@/components/ui/icons";

// The order is read per request with the browser's token, so a status the shop
// changed a second ago is the one on the page - and no cache can pin an old
// status to a shared URL.
export const dynamic = "force-dynamic";

/**
 * Two ways to arrive without an order: a link that lost its `?t=` key, and a
 * link whose key does not match the number. They get different copy because
 * the fixes are different - one is "use the form again", the other is "your
 * link is broken".
 */
function MissingOrder({ number, hadToken }: { number: string; hadToken: boolean }) {
  return (
    <Card bordered className="flex flex-col gap-4 p-6">
      <p className="font-sans text-lg font-bold">
        {hadToken
          ? `We can't find order ${number}.`
          : "This tracking link is missing its private key."}
      </p>
      <p className="font-sans text-sm leading-relaxed text-black/60">
        {hadToken
          ? "The link may be incomplete, or it belongs to a different order number. Open the order again with your order number and the phone number you used at checkout."
          : "Order links carry a private key so that a guessed order number cannot open someone else's address. Enter your order number and phone number on the tracking page to get a working link."}
      </p>
      <Button href="/track-order" variant="primary" className="self-start">
        Track an order
      </Button>
    </Card>
  );
}

export default async function OrderDetailPage({
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
          Order details
        </h1>
        <MissingOrder number={number} hadToken={token.length > 0} />
      </div>
    );
  }

  const qty = totalQuantity(order);
  const canCancel = canCustomerCancel(order.status);
  const orderPath = `/track-order/${encodeURIComponent(order.orderNumber)}`;
  const here = `${orderPath}?t=${encodeURIComponent(token)}`;
  // The query has to come after the path. Building this by appending to `here`
  // produced `/track-order/OCN-48215?t=abc/history`, which is a different order
  // number to the router and lands on "we can't find this order".
  const historyHref = `${orderPath}/history?t=${encodeURIComponent(token)}`;

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

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-line px-2.5 py-1 font-sans text-[11px] font-bold uppercase tracking-wide">
              {PAYMENT_LABEL[order.paymentStatus]}
            </span>
            <span className="font-sans text-[11px] text-black/55">{paymentNote(order)}</span>
          </div>
          <p className="font-sans text-xs text-black/50">
            This is the shop&apos;s own record of your order. Reload after the
            shop packs or dispatches it to see the next step — no payment was
            taken.
          </p>
        </Card>

        <section>
          <h2 className="mb-2 font-sans text-sm font-bold uppercase tracking-wide">
            Items in your order
          </h2>
          <Card bordered className="divide-y divide-line">
            <ul>
              {order.lines.map((line, i) => (
                <li key={i} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold leading-snug">
                      {line.name}
                    </p>
                    <p className="mt-1 font-sans text-xs text-black/50">
                      Qty {line.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm">
                    {formatNaira(line.lineTotal)}
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
                <dt className="text-black/60">Delivery · zone {order.zone}</dt>
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
            <p className="font-sans text-sm text-black/60">{order.delivery.state}</p>
            <p className="mt-2 font-mono text-sm">{order.delivery.phone}</p>
          </Card>
        </section>

        <div className="flex flex-col gap-3">
          <Button href={historyHref} variant="primary" className="w-full">
            Package history
          </Button>

          <CancelOrderPanel
            orderNumber={order.orderNumber}
            token={token}
            canCancel={canCancel}
          />

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
