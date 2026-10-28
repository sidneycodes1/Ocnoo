import { getBrowserClient, getServerClient } from "@/lib/supabase";

// `cancelled` is a real state, not a decorative tab: it is only ever set by the
// customer's own cancel call or by the admin panel, and both refuse once the
// order has shipped.
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
  /** Optional in the database, asked for on the form. Order mail goes here. */
  email: string;
  address: string;
  state: string;
}

/**
 * Where the money is. Deliberately separate from `OrderStatus`, which tracks
 * the parcel: a bank transfer can be confirmed while the order is still packed,
 * and a dispatched order can still be awaiting its money.
 */
export type PaymentStatus = "awaiting" | "claimed" | "confirmed";

export interface Order {
  orderNumber: string;
  /**
   * Random per order, generated in SQL. The tracking URL carries it, so the
   * order number alone is not enough to read someone's address.
   */
  trackToken: string;
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  /** Delivery zone the fee was quoted from, kept for the receipt display. */
  zone: "A" | "B" | "C";
  delivery: OrderDelivery;
  payment: "paystack" | "transfer";
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  /** ISO timestamp, set when the customer declared the transfer. */
  paidAt?: string;
  /** ISO timestamp, set when the order was placed. */
  createdAt: string;
  /** ISO timestamp, set when the order was cancelled. */
  cancelledAt?: string;
  /**
   * The rung the order had reached when it was cancelled. Kept because
   * `status` alone cannot tell the history screen how far the ladder got
   * before it stopped.
   */
  cancelledFrom?: Exclude<OrderStatus, "cancelled">;
}

/** Exactly what `public.order_payload()` returns, snake_case and all. */
interface OrderPayload {
  order_number: string;
  track_token: string;
  customer_name: string;
  phone: string;
  customer_email: string | null;
  address: string;
  state: string;
  zone: "A" | "B" | "C";
  payment_method: "paystack" | "transfer";
  payment_status: PaymentStatus;
  paid_at: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  placed_at: string;
  cancelled_at: string | null;
  cancelled_from: string | null;
  items: { name: string; unit_price: number; quantity: number; line_total: number }[];
  events: { status: string; note: string | null; at: string }[];
}

function orderFromPayload(payload: OrderPayload): Order {
  return {
    orderNumber: payload.order_number,
    trackToken: payload.track_token ?? "",
    lines: (payload.items ?? []).map((item) => ({
      name: item.name,
      quantity: item.quantity,
      lineTotal: item.line_total,
    })),
    subtotal: payload.subtotal,
    deliveryFee: payload.delivery_fee,
    total: payload.total,
    zone: payload.zone,
    delivery: {
      name: payload.customer_name,
      phone: payload.phone,
      email: payload.customer_email ?? "",
      address: payload.address,
      state: payload.state,
    },
    payment: payload.payment_method,
    paymentStatus: payload.payment_status ?? "awaiting",
    status: payload.status,
    paidAt: payload.paid_at ?? undefined,
    createdAt: payload.placed_at,
    cancelledAt: payload.cancelled_at ?? undefined,
    cancelledFrom: (payload.cancelled_from as Order["cancelledFrom"]) ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export interface PlaceOrderInput {
  customer: OrderDelivery;
  zone: "A" | "B" | "C";
  payment: "paystack" | "transfer";
  items: { productId: string; quantity: number }[];
}

export interface PlacedOrder {
  orderNumber: string;
  trackToken: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  placedAt: string;
}

export type PlaceOrderResult =
  | { ok: true; order: PlacedOrder }
  | { ok: false; message: string };

const NOT_CONNECTED =
  "The shop is not connected to its database yet, so orders cannot be saved. Tell the shop owner — this build is still a prototype.";

/**
 * Turns a Postgres exception into something a customer can act on. The RPC
 * raises bare codes ("OUT_OF_STOCK:Espresso Machine") because SQL cannot know
 * how the storefront phrases things.
 */
function messageFor(raw: string): string {
  if (raw.includes("MISSING_CUSTOMER")) return "Please complete the delivery details.";
  if (raw.includes("BAD_PAYMENT")) return "Choose how you would like to pay.";
  if (raw.includes("BAD_EMAIL")) return "That email address does not look right. Please check it.";
  if (raw.includes("EMPTY_ORDER")) return "Your cart is empty.";
  if (raw.includes("PRODUCT_MISSING")) {
    return "One of the items in your cart is no longer in the catalogue. Remove it and try again.";
  }
  const unavailable = /PRODUCT_UNAVAILABLE:(.+)$/.exec(raw);
  if (unavailable) {
    return `“${unavailable[1].trim()}” was just unpublished by the shop. Remove it from your cart and try again.`;
  }
  const soldOut = /OUT_OF_STOCK:(.+)$/.exec(raw);
  if (soldOut) {
    return `“${soldOut[1].trim()}” just sold out. Remove it from your cart and try again.`;
  }
  // An unrecognised Postgres message used to be reported to the customer as a
  // network problem, which sent more than one debugging session to the wrong
  // application. In development the real message is shown as written.
  if (process.env.NODE_ENV !== "production") {
    return `Order rejected by the database: ${raw}`;
  }
  return "We could not place the order just now. Check your connection and try again.";
}

/**
 * The one write the storefront is allowed to make. Prices, totals and stock are
 * computed inside the SQL function from the product rows, so nothing here can
 * be trusted with money - this only says *what* was bought and by whom.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
  const client = getBrowserClient();
  if (!client) return { ok: false, message: NOT_CONNECTED };

  const { data, error } = await client.rpc("place_order", {
    payload: {
      customer: input.customer,
      zone: input.zone,
      payment: input.payment,
      items: input.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    },
  });

  if (error) {
    console.warn(`[orders] place_order failed: ${error.message}`);
    return { ok: false, message: messageFor(error.message) };
  }

  const row = data as {
    order_number: string;
    track_token: string;
    subtotal: number;
    delivery_fee: number;
    total: number;
    payment_status?: PaymentStatus;
    placed_at: string;
  };

  return {
    ok: true,
    order: {
      orderNumber: row.order_number,
      trackToken: row.track_token,
      subtotal: row.subtotal,
      deliveryFee: row.delivery_fee,
      total: row.total,
      paymentStatus: row.payment_status ?? "awaiting",
      placedAt: row.placed_at,
    },
  };
}

/** Rebuilds the device-local order record from the server's receipt + the form. */
export function orderFromPlaced(
  placed: PlacedOrder,
  input: PlaceOrderInput,
  lines: OrderLine[]
): Order {
  return {
    orderNumber: placed.orderNumber,
    trackToken: placed.trackToken,
    lines,
    subtotal: placed.subtotal,
    deliveryFee: placed.deliveryFee,
    total: placed.total,
    zone: input.zone,
    delivery: input.customer,
    payment: input.payment,
    paymentStatus: placed.paymentStatus,
    status: "placed",
    createdAt: placed.placedAt,
  };
}

// ---------------------------------------------------------------------------
// Tracking
// ---------------------------------------------------------------------------

/**
 * Number + phone, for a customer on a device that has never seen the order.
 * The phone is matched on its last 10 digits inside SQL, so "0803…" and
 * "+234803…" are the same number.
 */
export async function trackOrder(
  orderNumber: string,
  phone: string
): Promise<Order | null> {
  const client = getBrowserClient();
  if (!client) return null;

  const { data, error } = await client.rpc("track_order", {
    p_number: orderNumber,
    p_phone: phone,
  });
  if (error) {
    console.warn(`[orders] track_order failed: ${error.message}`);
    return null;
  }
  return data ? orderFromPayload(data as OrderPayload) : null;
}

/**
 * The token path: whoever holds the link holds the order, which is why the
 * token is random and never derived from the number. Read on the server so the
 * detail pages render with the order already in the HTML.
 */
export async function getOrderByToken(
  orderNumber: string,
  token: string
): Promise<Order | null> {
  const client = getServerClient();
  if (!client || !token) return null;

  const { data, error } = await client.rpc("track_order_by_token", {
    p_number: orderNumber,
    p_token: token,
  });
  if (error) {
    console.warn(`[orders] track_order_by_token failed: ${error.message}`);
    return null;
  }
  return data ? orderFromPayload(data as OrderPayload) : null;
}

export type CancelResult = "ok" | "too-late" | "not-found";

/**
 * The last status a customer can still cancel from. Once an order is dispatched
 * it is with the courier, so the control is not rendered at all rather than
 * shown and disabled - that is what the marketplaces do, and it avoids
 * promising a cancellation that cannot happen. The SQL function enforces the
 * same rule, this only decides whether to draw the button.
 */
export function canCustomerCancel(status: OrderStatus): boolean {
  return status === "placed" || status === "packed";
}

export async function cancelMyOrder(
  orderNumber: string,
  token: string
): Promise<CancelResult> {
  const client = getBrowserClient();
  if (!client) return "not-found";

  const { data, error } = await client.rpc("cancel_my_order", {
    p_number: orderNumber,
    p_token: token,
  });
  if (error) {
    console.warn(`[orders] cancel_my_order failed: ${error.message}`);
    return "not-found";
  }
  const result = data as { ok?: boolean; reason?: string } | null;
  if (result?.ok) return "ok";
  return result?.reason === "TOO_LATE" ? "too-late" : "not-found";
}

export type ClaimResult = "ok" | "not-found" | "cancelled";

/**
 * The customer's declaration that a bank transfer has been made. It does not
 * move the order along the delivery ladder and it does not mark anything paid -
 * the shop verifies the money and does that. What it does is stop the order
 * looking unclaimed in the dashboard, which is the whole reason the button
 * exists. Token-gated for the same reason as cancelling: the order number alone
 * proves nothing.
 */
export async function claimPayment(
  orderNumber: string,
  token: string
): Promise<ClaimResult> {
  const client = getBrowserClient();
  if (!client) return "not-found";

  const { data, error } = await client.rpc("claim_payment", {
    p_number: orderNumber,
    p_token: token,
  });
  if (error) {
    console.warn(`[orders] claim_payment failed: ${error.message}`);
    return "not-found";
  }
  const result = data as { ok?: boolean; reason?: string } | null;
  if (result?.ok) return "ok";
  return result?.reason === "CANCELLED" ? "cancelled" : "not-found";
}
