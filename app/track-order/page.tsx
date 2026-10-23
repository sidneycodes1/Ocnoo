"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOrders } from "@/context/OrdersContext";
import { TABS, ordersInTab, type TabKey } from "@/lib/orderStatus";
import OrderRow from "@/components/order/OrderRow";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

/**
 * Turns a typed order number into the detail screen. When the number matches an
 * order on this device it navigates, so a deep link and a typed number end up in
 * exactly the same place. When it does not match, the caller shows its own
 * message - this demo has no server to ask.
 */
function NumberLookup({ autoFocus = false }: { autoFocus?: boolean }) {
  const { findByNumber } = useOrders();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [missed, setMissed] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    const match = findByNumber(query);
    if (match) {
      router.push(`/track-order/${encodeURIComponent(match.orderNumber)}`);
      return;
    }
    setMissed(true);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-sans text-sm font-bold uppercase tracking-wide">
          Order number
        </span>
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setMissed(false);
          }}
          placeholder="OCN-00000"
          autoComplete="off"
          autoFocus={autoFocus || undefined}
        />
      </label>
      <Button type="submit" variant="primary" className="self-start">
        Track
      </Button>
      {missed && (
        <p
          role="status"
          className="rounded-xl border border-line bg-surface p-3 font-sans text-sm"
        >
          No order with that number is saved on this device. Orders are stored in
          this browser only, so one placed on another device or in another browser
          will not appear here.
        </p>
      )}
    </form>
  );
}

function TrackOrderBody() {
  const { orders, hydrated } = useOrders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<TabKey>("ongoing");

  // A ?number= link (from an old bookmark or a shared URL) resolves to the
  // detail screen rather than rendering a second, weaker version of it here.
  const number = searchParams.get("number");
  useEffect(() => {
    if (!hydrated || !number) return;
    router.replace(`/track-order/${encodeURIComponent(number.trim())}`);
  }, [hydrated, number, router]);

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-black/50">Loading your orders…</p>
    );
  }

  if (number) return null;

  // Nobody has ordered on this device: the number form is the whole screen, and
  // there is nothing to list.
  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <p className="rounded-xl border border-line bg-surface p-4 font-sans text-sm leading-relaxed">
          You have not placed an order in this browser, so there is nothing to
          track yet. Orders are saved on the device they were placed on — this
          demo has no account system that could carry them across.
        </p>
        <div className="border-t border-line pt-6">
          <h2 className="mb-3 font-sans text-sm font-bold uppercase tracking-wide">
            Have an order number?
          </h2>
          <NumberLookup autoFocus />
        </div>
      </div>
    );
  }

  const counts = TABS.reduce<Record<TabKey, number>>(
    (acc, t) => ({ ...acc, [t.key]: ordersInTab(orders, t.key).length }),
    { ongoing: 0, delivered: 0, cancelled: 0 }
  );
  const visible = ordersInTab(orders, tab);

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Order status"
        className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4"
      >
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              id={`orders-tab-${t.key}`}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls="orders-panel"
              onClick={() => setTab(t.key)}
              className={
                "min-h-[44px] shrink-0 border-b-2 px-3 font-sans text-sm font-bold uppercase tracking-wide " +
                (active
                  ? "border-primary text-black"
                  : "border-transparent text-black/45")
              }
            >
              {t.label}
              <span className="ml-1.5 font-mono text-xs font-normal">
                ({counts[t.key]})
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="orders-panel"
        role="tabpanel"
        aria-labelledby={`orders-tab-${tab}`}
        aria-live="polite"
      >
        {visible.length === 0 ? (
          <p className="rounded-xl border border-line bg-surface p-4 font-sans text-sm">
            {tab === "cancelled"
              ? "No cancelled orders."
              : tab === "delivered"
              ? "Nothing delivered yet."
              : "Nothing on the way right now."}
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {visible.map((order) => (
              <li key={order.orderNumber}>
                <OrderRow order={order} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <details className="border-t border-line pt-4">
        <summary className="min-h-[44px] cursor-pointer list-none font-sans text-sm font-bold uppercase tracking-wide [&::-webkit-details-marker]:hidden">
          Track an order number from another device
        </summary>
        <div className="pt-3">
          <NumberLookup />
        </div>
      </details>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl animate-fade-in px-4 pb-8 pt-3 md:py-8">
      <h1 className="mb-1 font-sans text-3xl font-extrabold uppercase tracking-tight sr-only md:not-sr-only">
        Track Your Orders
      </h1>
      <p className="mb-6 font-sans text-sm text-black/60">
        Every order placed in this browser, newest first.
      </p>

      {/* useSearchParams bails the route out of static rendering unless it sits
          under a Suspense boundary. */}
      <Suspense fallback={null}>
        <TrackOrderBody />
      </Suspense>
    </div>
  );
}
