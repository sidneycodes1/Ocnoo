import Link from "next/link";
import type { Order } from "@/context/OrdersContext";
import { formatNaira } from "@/lib/utils";
import { shortDate, statusNote, totalQuantity } from "@/lib/orderStatus";
import Card from "@/components/ui/Card";
import StatusChip from "@/components/order/StatusChip";

/**
 * One order in a list. Used by both the tracking screen and My Purchases, so the
 * two surfaces cannot drift apart on what an order row contains.
 *
 * The row deliberately shows only what the order actually carries: the first
 * line's name, a "+n more" count, the number, the date, the total and the status.
 * Full line-by-line breakdown lives on the detail screen.
 */
export default function OrderRow({ order }: { order: Order }) {
  const href = `/track-order/${encodeURIComponent(order.orderNumber)}`;
  const first = order.lines[0];
  const extraLines = order.lines.length - 1;
  const qty = totalQuantity(order);

  return (
    <Card bordered className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 font-sans text-sm font-bold leading-snug">
            {first ? first.name : "Order"}
            {extraLines > 0 && (
              <span className="font-sans font-normal text-black/55">
                {" "}
                +{extraLines} more
              </span>
            )}
          </p>
          <p className="mt-1 font-mono text-xs text-black/55">{order.orderNumber}</p>
          <p className="font-sans text-xs text-black/50">
            {shortDate(order.createdAt)} · {qty} item{qty === 1 ? "" : "s"} ·{" "}
            {formatNaira(order.total)}
          </p>
        </div>
        <StatusChip status={order.status} />
      </div>

      <p className="font-sans text-xs leading-relaxed text-black/60">
        {statusNote(order)}
      </p>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <Link
          href={href}
          className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
        >
          See details
        </Link>
        <span className="font-mono text-sm font-bold">{formatNaira(order.total)}</span>
      </div>
    </Card>
  );
}
