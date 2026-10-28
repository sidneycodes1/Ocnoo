"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useOrders } from "@/context/OrdersContext";
import { trackOrder } from "@/lib/orders";
import { supabaseConfigured } from "@/lib/supabase";
import { TABS, ordersInTab, type TabKey } from "@/lib/orderStatus";
import OrderRow from "@/components/order/OrderRow";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

type Lookup = "idle" | "searching" | "missed" | "offline";

/**
 * Number + phone, for any device. The pair is checked inside the database
 * function, which returns the order only when the last ten digits of the phone
 * match - so the form can confirm an order without ever exposing the table.
 * On a hit the browser moves to the detail screen carrying the order's random
 * token, which is what every later refresh uses.
 */
function NumberLookup({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [lookup, setLookup] = useState<Lookup>("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!number.trim() || !phone.trim() || lookup === "searching") return;
    if (!supabaseConfigured) {
      setLookup("offline");
      return;
    }
    setLookup("searching");
    const found = await trackOrder(number.trim(), phone.trim());
    if (!found) {
      setLookup("missed");
      return;
    }
    router.push(
      `/track-order/${encodeURIComponent(found.orderNumber)}?t=${encodeURIComponent(
        found.trackToken
      )}`
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="font-sans text-sm font-bold uppercase tracking-wide">
          Order number
        </span>
        <Input
          value={number}
          onChange={(e) => {
            setNumber(e.target.value);
            setLookup("idle");
          }}
          placeholder="OCN-00000"
          autoComplete="off"
          autoFocus={autoFocus || undefined}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-sans text-sm font-bold uppercase tracking-wide">
          Phone number used
        </span>
        <Input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setLookup("idle");
          }}
          placeholder="e.g. 08000000000"
          autoComplete="tel"
        />
      </label>

      <Button
        type="submit"
        variant="primary"
        disabled={lookup === "searching" || !number.trim() || !phone.trim()}
        className="self-start"
      >
        {lookup === "searching" ? "Looking…" : "Track"}
      </Button>

      {lookup === "missed" && (
        <p
          role="status"
          className="rounded-xl border border-line bg-surface p-3 font-sans text-sm leading-relaxed"
        >
          No order matches that number and phone number. Check the order number
          on your confirmation screen, and use the same phone number you entered
          at checkout.
        </p>
      )}

      {lookup === "offline" && (
        <p
          role="status"
          className="rounded-xl border border-line bg-surface p-3 font-sans text-sm leading-relaxed"
        >
          This build is not connected to the shop&apos;s database yet, so
          tracking is unavailable. Orders placed on this device still appear
          below.
        </p>
      )}
    </form>
  );
}

function TrackOrderBody() {
  const { orders, hydrated } = useOrders();
  const [tab, setTab] = useState<TabKey>("ongoing");

  if (!hydrated) {
    return (
      <p className="font-sans text-sm text-black/50">Loading your orders…</p>
    );
  }

  // Nobody has ordered on this device: the number form is the whole screen, and
  // there is nothing to list.
  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <p className="rounded-xl border border-line bg-surface p-4 font-sans text-sm leading-relaxed">
          No orders on this device yet. If you have an order number, open it
          below with the phone number you used at checkout.
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
          Track an order placed on another device
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
        Orders placed in this browser, newest first — or any order number you
        have from another device.
      </p>

      <TrackOrderBody />
    </div>
  );
}
