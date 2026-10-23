import type { OrderStatus } from "@/context/OrdersContext";
import { STATUS_LABEL } from "@/lib/orderStatus";

/**
 * Neutral on purpose. A coloured chip reads as a verdict, and the only colour
 * that would suit "cancelled" (the danger red) fails contrast as small text on
 * the card surface. The word carries the meaning.
 */
export default function StatusChip({ status }: { status: OrderStatus }) {
  return (
    <span className="shrink-0 rounded-full bg-surface px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-wide text-black">
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
