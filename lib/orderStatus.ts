import type { Order, OrderStatus } from "@/context/OrdersContext";

/**
 * One place that decides what an order's status means in words, so the order
 * list, the order detail screen and the package history can never disagree.
 */

export interface Step {
  key: Exclude<OrderStatus, "cancelled">;
  label: string;
  note: string;
}

/** The ladder a parcel climbs. `cancelled` is an exit from it, not a rung. */
export const LADDER: Step[] = [
  {
    key: "placed",
    label: "Order placed",
    note: "We have the order. Nothing has been charged — this demo takes no payment.",
  },
  {
    key: "packed",
    label: "Packed",
    note: "Your items are packed and labelled, ready for the courier.",
  },
  {
    key: "dispatched",
    label: "Dispatched",
    note: "It is with the courier and travelling to the address you gave us.",
  },
  {
    key: "delivered",
    label: "Delivered",
    note: "Handed over at the delivery address.",
  },
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Order placed",
  packed: "Packed",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Position on the ladder, or -1 for a cancelled order. */
export function stepIndex(status: OrderStatus): number {
  return LADDER.findIndex((s) => s.key === status);
}

export type TabKey = "ongoing" | "delivered" | "cancelled";

export const TABS: { key: TabKey; label: string }[] = [
  { key: "ongoing", label: "Ongoing" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export function tabOf(order: Order): TabKey {
  if (order.status === "cancelled") return "cancelled";
  if (order.status === "delivered") return "delivered";
  return "ongoing";
}

export function ordersInTab(orders: Order[], tab: TabKey): Order[] {
  return orders.filter((o) => tabOf(o) === tab);
}

/**
 * The line shown under the status chip.
 *
 * Deliberately no delivery window ("between Tuesday and Thursday"): an order
 * only carries `createdAt`, so a promised range would be invented. The status
 * itself is the honest statement.
 */
export function statusNote(order: Order): string {
  if (order.status === "cancelled") {
    return "This order was cancelled. Nothing was charged.";
  }
  const step = LADDER.find((s) => s.key === order.status);
  return step ? step.note : "";
}

/** Units across all lines - an order of 3 x one item is "3 items", not "1". */
export function totalQuantity(order: Order): number {
  return order.lines.reduce((n, l) => n + l.quantity, 0);
}

/**
 * "Wednesday, 21 October" - the long form used on the timeline.
 *
 * An order carries exactly two timestamps: when it was placed and, if it was
 * cancelled, when that happened. Only those two dates are ever printed, so an
 * undated rung shows no date rather than an invented one.
 */
export function longDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** "21 Oct 2026" — the compact form used in lists. */
export function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
