"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Order } from "@/lib/orders";

export type { Order, OrderDelivery, OrderLine, OrderStatus, PaymentStatus } from "@/lib/orders";

interface OrdersContextValue {
  /**
   * Orders placed in this browser. The database is the authority on everything
   * that can change (status, cancellation); this list is the shortcut that lets
   * a returning customer see their own orders without retyping a phone number.
   */
  orders: Order[];
  hydrated: boolean;
  addOrder: (order: Order) => void;
  /**
   * Patch one saved order after something on this device changed it — declaring
   * a bank transfer, for instance. Without it the confirmation screen and the
   * Purchases list would disagree with the database until the next page load.
   */
  updateOrder: (orderNumber: string, patch: Partial<Order>) => void;
}

// Same localStorage discipline as the cart: hydrate once, persist after, and
// never write during the pre-hydration render.
const STORAGE_KEY = "ocnoo-orders";
const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // The status sweep runs once per page load, so a refresh cannot loop through
  // setOrders below and re-fire every RPC.
  const swept = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Order[];
        if (Array.isArray(parsed)) {
          setOrders(
            parsed.filter(
              (o) => o && typeof o.orderNumber === "string" && Array.isArray(o.lines)
            )
          );
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  // The stored copy was written at checkout time, so it still says "placed"
  // after the shop packs or dispatches the parcel, and still says "awaiting"
  // after the money is verified. One `track_order` call per saved order brings
  // the list in line with the shared database; the detail screen re-reads the
  // same order anyway, so a miss here only costs a stale chip, never a wrong
  // answer.
  useEffect(() => {
    if (!hydrated || swept.current) return;
    swept.current = true;
    const snapshot = orders;
    if (snapshot.length === 0) return;

    void (async () => {
      // Loaded on demand: a first-time visitor has no saved orders, and nobody
      // should download the Supabase client for a sweep that cannot run.
      const { trackOrder } = await import("@/lib/orders");
      const refreshed = await Promise.all(
        snapshot.map(async (order) => {
          if (!order.trackToken || order.status === "cancelled") return order;
          const live = await trackOrder(order.orderNumber, order.delivery.phone);
          if (!live) return order;
          const changed = live.status !== order.status || live.paymentStatus !== order.paymentStatus;
          if (!changed) return order;
          return {
            ...order,
            status: live.status,
            paymentStatus: live.paymentStatus,
            paidAt: live.paidAt,
            cancelledAt: live.cancelledAt,
            cancelledFrom: live.cancelledFrom,
          };
        })
      );
      if (refreshed.some((o, i) => o !== snapshot[i])) {
        setOrders((prev) =>
          prev.map((order) => refreshed.find((r) => r.orderNumber === order.orderNumber) ?? order)
        );
      }
    })();
  }, [hydrated, orders]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      // Keep the most recent 25 so the payload cannot grow without bound.
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(orders.slice(0, 25))
      );
    } catch {
      /* storage may be unavailable; orders still work in-memory */
    }
  }, [orders, hydrated]);

  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const updateOrder = useCallback((orderNumber: string, patch: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.orderNumber === orderNumber ? { ...order, ...patch } : order
      )
    );
  }, []);

  const value = useMemo<OrdersContextValue>(
    () => ({ orders, hydrated, addOrder, updateOrder }),
    [orders, hydrated, addOrder, updateOrder]
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return ctx;
}
