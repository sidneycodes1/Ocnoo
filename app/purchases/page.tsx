"use client";

import { useOrders } from "@/context/OrdersContext";
import OrderRow from "@/components/order/OrderRow";
import EmptyState from "@/components/pages/EmptyState";
import { BagIcon } from "@/components/ui/icons";

/**
 * My Purchases. The row itself is the shared OrderRow used by the tracking
 * screen, so the two lists can never disagree about what an order shows; the
 * line-by-line breakdown lives on the order detail screen.
 */
export default function PurchasesPage() {
  const { orders, hydrated } = useOrders();

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center font-sans">
        Loading your purchases…
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<BagIcon size={40} />}
        title="My Purchases"
        description="Orders you place in this browser appear here."
        action={{ label: "Start shopping", href: "/shop" }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 pb-8 pt-3 md:py-8">
      <h1 className="mb-6 font-sans text-3xl font-extrabold uppercase tracking-tight sr-only md:not-sr-only">
        My Purchases
      </h1>

      <ul className="flex flex-col gap-4">
        {orders.map((order) => (
          <li key={order.orderNumber}>
            <OrderRow order={order} />
          </li>
        ))}
      </ul>

      <p className="mt-6 font-sans text-xs leading-relaxed text-black/50">
        These are stored in this browser only — this demo has no account system,
        so clearing site data removes them.
      </p>
    </div>
  );
}
