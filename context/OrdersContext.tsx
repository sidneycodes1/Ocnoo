"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// `cancelled` is a real state, not a decorative tab: it is only ever set through
// cancelOrder below, which refuses once the order has shipped.
export type OrderStatus =
  | "placed"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface OrderLine {
  name: string;
  quantity: number;
  lineTotal: number;
}

export interface OrderDelivery {
  name: string;
  phone: string;
  address: string;
  state: string;
}

export interface Order {
  orderNumber: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Delivery zone the fee was quoted from, kept for the receipt display. */
  zone: "A" | "B" | "C";
  delivery: OrderDelivery;
  payment: "paystack" | "transfer";
  status: OrderStatus;
  /** ISO timestamp, set when the order was placed. */
  createdAt: string;
  /** ISO timestamp, set by cancelOrder. Absent on every order not cancelled. */
  cancelledAt?: string;
  /**
   * The rung the order had reached when it was cancelled. Kept because
   * `status` alone cannot tell the history screen how far the ladder got
   * before it stopped.
   */
  cancelledFrom?: Exclude<OrderStatus, "cancelled">;
}

/**
 * The last status a customer can still cancel from. Once an order is dispatched
 * it is with the courier, so the cancel control is not rendered at all rather
 * than shown and disabled - that is what the marketplaces do, and it avoids
 * promising a cancellation that cannot happen.
 */
export const CANCELLABLE: OrderStatus[] = ["placed", "packed"];

interface OrdersContextValue {
  orders: Order[];
  hydrated: boolean;
  addOrder: (order: Order) => void;
  findByNumber: (orderNumber: string) => Order | undefined;
  /** Returns false when the order is unknown or already too far to cancel. */
  cancelOrder: (orderNumber: string) => boolean;
}

// Same localStorage discipline as the cart: hydrate once, persist after, and
// never write during the pre-hydration render.
const STORAGE_KEY = "ocnoo-orders";
const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hydrated, setHydrated] = useState(false);

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

  const findByNumber = useCallback(
    (orderNumber: string) => {
      const needle = orderNumber.trim().toLowerCase();
      return orders.find((o) => o.orderNumber.toLowerCase() === needle);
    },
    [orders]
  );

  const cancelOrder = useCallback(
    (orderNumber: string) => {
      const target = orders.find(
        (o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase()
      );
      const from = target?.status;
      // Narrowed explicitly rather than through CANCELLABLE.includes, which
      // cannot tell the compiler that "cancelled" is not in the list.
      if (!target || from === "cancelled" || !from || !CANCELLABLE.includes(from)) {
        return false;
      }
      const cancelledAt = new Date().toISOString();
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === target.orderNumber
            ? {
                ...o,
                status: "cancelled" as OrderStatus,
                cancelledAt,
                cancelledFrom: from,
              }
            : o
        )
      );
      return true;
    },
    [orders]
  );

  const value = useMemo<OrdersContextValue>(
    () => ({ orders, hydrated, addOrder, findByNumber, cancelOrder }),
    [orders, hydrated, addOrder, findByNumber, cancelOrder]
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
