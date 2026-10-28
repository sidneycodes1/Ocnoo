"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useOrders, type Order } from "@/context/OrdersContext";
import { formatAddress, useAddresses, type Address } from "@/context/AddressesContext";
import { useProfile } from "@/context/ProfileContext";
import { formatNaira } from "@/lib/utils";
import { NG_STATES, getDeliveryQuote } from "@/lib/delivery";
import { claimPayment, orderFromPlaced, placeOrder } from "@/lib/orders";
import { trackEvent } from "@/lib/events";
import { getLga } from "@/data/nigeria/locations";
import { BUSINESS } from "@/lib/business";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import PriceTag from "@/components/ui/PriceTag";
import Card from "@/components/ui/Card";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

type PaymentMethod = "paystack" | "transfer";

interface Delivery {
  name: string;
  phone: string;
  email: string;
  address: string;
  state: string;
}

const emptyDelivery: Delivery = { name: "", phone: "", email: "", address: "", state: "" };

/** Matches the check inside `place_order`, so the two never disagree. */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** What a saved address looks like once it is dropped into the form. */
function deliveryFrom(a: Address): Delivery {
  return {
    name: a.recipientName,
    phone: a.phone,
    // Addresses do not carry an email, so this stays empty and the caller keeps
    // whatever the customer already typed.
    email: "",
    // The LGA belongs on the rider's line: "Ikeja" as a town and Ikeja as the
    // local government are different scopes, and the street alone is ambiguous.
    address: [a.address, a.city, a.lga ? getLga(a.lga)?.name ?? "" : ""]
      .filter(Boolean)
      .join(", "),
    state: a.state,
  };
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-sm font-bold uppercase tracking-wide">
        {label}
      </span>
      {children}
      {error && <span className="font-sans text-sm font-bold">{error}</span>}
    </label>
  );
}

function CardIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" />
      <path d="M2 10h20" />
    </svg>
  );
}

function BankIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 21h18M4 21V10M20 21V10M2 10l10-6 10 6M8 21v-7M12 21v-7M16 21v-7" />
    </svg>
  );
}

export default function CheckoutPage() {
  const { lines, subtotal, clearCart, hydrated } = useCart();
  const { addOrder, updateOrder } = useOrders();
  const {
    addresses,
    defaultAddress,
    hydrated: addressesHydrated,
  } = useAddresses();
  const { profile, hydrated: profileHydrated } = useProfile();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [delivery, setDelivery] = useState<Delivery>(emptyDelivery);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  /** True while the order is in flight, so the button cannot be double-fired. */
  const [placing, setPlacing] = useState(false);
  /** The RPC's refusal, in words the customer can act on. */
  const [placeError, setPlaceError] = useState<string | null>(null);
  /** Which picker row is highlighted. Cleared the moment a field is typed in. */
  const [chosenId, setChosenId] = useState<string | null>(null);
  /** In flight / refused, for the "I have made payment" declaration. */
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Step 1 is the same four questions on every order. Fill them from the
  // Address Book (or the saved profile for the contact rows) once the stores
  // have loaded, so a returning visitor only ever has to confirm.
  const seeded = useRef(false);
  useEffect(() => {
    if (!hydrated || !addressesHydrated || !profileHydrated || seeded.current) return;
    seeded.current = true;
    if (defaultAddress) {
      setChosenId(defaultAddress.id);
      setDelivery(deliveryFrom(defaultAddress));
      return;
    }
    const fullName = `${profile.firstName} ${profile.lastName}`.trim();
    if (!fullName && !profile.phone && !profile.email) return;
    setDelivery((d) => ({
      ...d,
      name: d.name || fullName,
      phone: d.phone || profile.phone,
      email: d.email || profile.email,
    }));
  }, [hydrated, addressesHydrated, profileHydrated, defaultAddress, profile]);

  /** Hand-typed delivery details are no longer "the saved address". */
  function editDelivery(key: keyof Delivery, value: string) {
    setChosenId(null);
    setDelivery((d) => ({ ...d, [key]: value }));
  }

  function applyAddress(a: Address) {
    setChosenId(a.id);
    // An address book row has no email, so picking one must not erase the
    // address the customer already typed above it.
    setDelivery((d) => ({ ...deliveryFrom(a), email: d.email }));
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center font-sans">
        Loading checkout…
      </div>
    );
  }

  const quote = getDeliveryQuote(delivery.state);
  const total = subtotal + quote.fee;

  // ---- Step 3: confirmation (rendered from the snapshot, cart already cleared)
  if (step === 3 && order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card className="p-6 md:p-8">
          <h1 className="font-sans text-3xl font-extrabold uppercase">
            Thank you!
          </h1>
          <p className="mt-2 font-sans">
            Your order has been received and is on the shop&apos;s dashboard
            now. This is a demo — no payment was taken.
          </p>

          <div className="mt-6 bg-surface rounded-xl p-4">
            <p className="font-sans text-sm uppercase tracking-wide">
              Order number
            </p>
            <p className="font-mono text-2xl font-bold">{order.orderNumber}</p>
            <p className="mt-1 font-sans text-xs text-black/50">
              Keep this number. With the phone number you entered, it tracks the
              order from any device.
            </p>
          </div>

          {/* Payment. The order is already written at this point, so declaring a
              transfer is an honest separate step rather than a fake "paid" tick:
              the customer reports what they did, the shop confirms the money. */}
          <div className="mt-6 rounded-xl border border-line bg-white p-4">
            {order.payment === "paystack" ? (
              <p className="font-sans text-sm text-black/60">
                Paystack was selected. Nothing is charged in this demo, so the
                order is recorded as awaiting payment.
              </p>
            ) : order.paymentStatus === "confirmed" ? (
              <p className="font-sans text-sm font-bold">
                Payment confirmed by the shop.
              </p>
            ) : order.paymentStatus === "claimed" ? (
              <>
                <p className="font-sans text-sm font-bold">
                  You told us the transfer is on its way.
                </p>
                <p className="mt-1 font-sans text-[11px] leading-relaxed text-black/50">
                  The shop checks the funds before anything is packed, so the
                  order stays here until that happens.
                </p>
              </>
            ) : (
              <>
                <p className="font-sans text-sm">
                  Transfer{" "}
                  <span className="font-mono font-bold">
                    {formatNaira(order.total)}
                  </span>{" "}
                  to {BUSINESS.bank.bankName}, account{" "}
                  <span className="font-mono font-bold">
                    {BUSINESS.bank.accountNumber}
                  </span>{" "}
                  ({BUSINESS.bank.accountName}).
                </p>
                <Button
                  variant="primary"
                  className="mt-3 w-full"
                  disabled={claiming}
                  onClick={() => void handleClaimPayment()}
                >
                  {claiming ? "Recording…" : "I Have Made Payment"}
                </Button>
                <p className="mt-2 font-sans text-[11px] leading-relaxed text-black/50">
                  This tells the shop to look out for your transfer. It is not a
                  confirmed payment until the funds arrive.
                </p>
              </>
            )}

            {claimError && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-surface p-3 font-sans text-sm font-bold"
              >
                {claimError}
              </p>
            )}

            {order.delivery.email && (
              <p className="mt-3 font-sans text-[11px] leading-relaxed text-black/50">
                A receipt for this order goes to {order.delivery.email}.
              </p>
            )}
          </div>

          {/* Mobile totals — delivery is quoted from the state entered in step 1. */}
          <div className="mt-6 flex flex-col gap-1 font-sans text-sm md:hidden">
            <div className="flex justify-between">
              <span className="text-black/60">Items</span>
              <PriceTag price={order.subtotal} tone="shell" size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-black/60">
                Delivery to {order.delivery.state} (zone {order.zone})
              </span>
              <PriceTag price={order.deliveryFee} tone="shell" size="sm" />
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-line pt-2 font-bold">
              <span>Total</span>
              <PriceTag price={order.total} tone="shell" />
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-black/45">
              Delivery fees are estimates and are confirmed before dispatch.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {order.lines.map((l, idx) => (
              <div key={idx} className="flex justify-between font-sans text-sm">
                <span>
                  {l.name} × {l.quantity}
                </span>
                <span className="font-mono">{formatNaira(l.lineTotal)}</span>
              </div>
            ))}
            <div className="mt-2 hidden justify-between border-t border-line pt-2 font-sans font-bold md:flex">
              <span>Subtotal</span>
              <span className="font-mono">{formatNaira(order.subtotal)}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-2 font-sans text-sm sm:grid-cols-2">
            <p>
              <span className="font-bold uppercase">Deliver to:</span>{" "}
              {order.delivery.name}, {order.delivery.phone}
            </p>
            <p className="sm:text-right">
              <span className="font-bold uppercase">Payment:</span>{" "}
              {order.payment === "paystack" ? "Paystack" : "Bank Transfer"}
            </p>
            <p className="sm:col-span-2">
              <span className="font-bold uppercase">Address:</span>{" "}
              {order.delivery.address}, {order.delivery.state}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/shop" variant="primary">
              Continue Shopping
            </Button>
            <Button
              href={`/track-order/${encodeURIComponent(
                order.orderNumber
              )}?t=${encodeURIComponent(order.trackToken)}`}
              variant="secondary"
            >
              Track this order
            </Button>
            <WhatsAppButton label="Chat to Confirm" />
          </div>
        </Card>
      </div>
    );
  }

  // ---- Empty-cart guard (only for the active steps)
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <h1 className="font-sans text-2xl font-extrabold uppercase">
            Your cart is empty
          </h1>
          <p className="font-sans">Add something before checking out.</p>
          <Button href="/shop" variant="primary">
            Shop Now
          </Button>
        </Card>
      </div>
    );
  }

  const emailTrimmed = delivery.email.trim();
  const emailOk = EMAIL_RE.test(emailTrimmed);

  const fieldsValid =
    delivery.name.trim() !== "" &&
    delivery.phone.trim() !== "" &&
    emailTrimmed !== "" &&
    emailOk &&
    delivery.address.trim() !== "" &&
    delivery.state !== "";

  const stepLabel = `Step ${step} of 3`;

  function handleContinueStep1() {
    setAttempted(true);
    if (fieldsValid) {
      setAttempted(false);
      setStep(2);
    }
  }

  /**
   * The only place the shop writes an order. The total on this page is a quote;
   * `place_order` re-prices every line from the product rows and refuses stock
   * it no longer has, so a failure here is a real answer rather than a bug -
   * and it is shown, not swallowed.
   */
  async function handlePlaceOrder() {
    if (!payment || placing) return;
    setPlacing(true);
    setPlaceError(null);

    const input = {
      customer: delivery,
      zone: quote.zone,
      payment,
      items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
    };

    const result = await placeOrder(input);
    if (!result.ok) {
      setPlaceError(result.message);
      // One event per failure, so the dashboard's "checkout errors today"
      // counts refusals (sold out, unpublished, offline) and nothing else.
      trackEvent("checkout_error", { path: "/checkout" });
      setPlacing(false);
      return;
    }

    const snapshot = orderFromPlaced(
      result.order,
      input,
      lines.map((l) => ({
        name: l.product.name,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
      }))
    );
    // The server has the order; this copy only feeds "My Purchases" on this
    // device and is refreshed against the database on the next visit.
    addOrder(snapshot);
    setOrder(snapshot);
    clearCart();
    setStep(3);
  }

  /**
   * Declares a transfer the customer says they made. The order already exists
   * by this point, so this is a real write with a real consequence: the shop's
   * dashboard shows it as claimed instead of idle. It deliberately does not
   * say the money arrived - only the shop can confirm that, and saying so from
   * the browser would be a lie the database would believe.
   */
  async function handleClaimPayment() {
    if (!order || claiming) return;
    setClaiming(true);
    setClaimError(null);

    const result = await claimPayment(order.orderNumber, order.trackToken);
    if (result === "ok") {
      const paidAt = new Date().toISOString();
      setOrder({ ...order, paymentStatus: "claimed", paidAt });
      updateOrder(order.orderNumber, { paymentStatus: "claimed", paidAt });
    } else if (result === "cancelled") {
      setClaimError("That order was cancelled, so there is nothing left to pay for.");
    } else {
      setClaimError("We could not record that just now. Check your connection and try again.");
    }
    setClaiming(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 font-sans text-3xl font-extrabold uppercase tracking-tight sr-only md:not-sr-only">
        Checkout
      </h1>
      <p className="mb-6 font-sans text-sm font-bold uppercase tracking-wide">
        {stepLabel}
      </p>

      {/* Step indicator */}
      <div className="mb-8 flex gap-2">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={
              "h-2 flex-1 rounded-full " +
              (step >= n ? "bg-accent" : "bg-disabled")
            }
          />
        ))}
      </div>

      {/* ---- STEP 1: Delivery info ---- */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          {/* The picker is only a shortcut to the same four fields below - they
              stay editable, so a saved address is a starting point, not a lock. */}
          {addresses.length > 0 && (
            <div className="rounded-xl border border-line bg-white p-4">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-sans text-xs font-bold uppercase tracking-wide text-black/50">
                  Saved addresses
                </h2>
                <Link
                  href="/account/addresses"
                  className="font-sans text-xs font-bold uppercase tracking-wide underline decoration-line underline-offset-4 hover:decoration-black"
                >
                  Manage
                </Link>
              </div>
              <div
                role="radiogroup"
                aria-label="Saved delivery addresses"
                className="mt-2 flex flex-col gap-2"
              >
                {addresses.map((a) => {
                  const active = a.id === chosenId;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => applyAddress(a)}
                      className={
                        "flex min-h-[44px] flex-col justify-center gap-0.5 rounded-lg border px-3 py-2 text-left " +
                        (active
                          ? "border-primary bg-primary/5"
                          : "border-line bg-white")
                      }
                    >
                      <span className="font-sans text-sm font-bold">
                        {a.label}
                        {a.isDefault && (
                          <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-black/50">
                            Default
                          </span>
                        )}
                      </span>
                      <span className="font-sans text-xs text-black/60">
                        {formatAddress(a)}
                      </span>
                    </button>
                  );
                })}
                {chosenId === null && (
                  <p className="font-sans text-xs text-black/55">
                    Using details you typed yourself.
                  </p>
                )}
              </div>
            </div>
          )}

          <Field label="Full name" error={attempted && !delivery.name.trim() ? "Required field." : undefined}>
            <Input
              value={delivery.name}
              onChange={(e) => editDelivery("name", e.target.value)}
              placeholder="e.g. Ada Obi"
            />
          </Field>

          <Field label="Phone" error={attempted && !delivery.phone.trim() ? "Required field." : undefined}>
            <Input
              type="tel"
              inputMode="tel"
              value={delivery.phone}
              onChange={(e) => editDelivery("phone", e.target.value)}
              placeholder="e.g. 08000000000"
            />
          </Field>

          {/* Asked for because it is the only channel that can carry an order
              receipt. The shop still calls or messages to confirm; this is what
              makes the confirmation survive after the tab is closed. */}
          <Field
            label="Email"
            error={
              attempted && !emailTrimmed
                ? "Required field."
                : attempted && !emailOk
                  ? "That does not look like an email address."
                  : undefined
            }
          >
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={delivery.email}
              onChange={(e) => editDelivery("email", e.target.value)}
              placeholder="you@example.com"
            />
          </Field>

          <Field label="Delivery address" error={attempted && !delivery.address.trim() ? "Required field." : undefined}>
            <Input
              value={delivery.address}
              onChange={(e) => editDelivery("address", e.target.value)}
              placeholder="Street, city"
            />
          </Field>

          <Field label="State" error={attempted && !delivery.state ? "Required field." : undefined}>
            <Select
              options={NG_STATES}
              placeholder="Select a state…"
              value={delivery.state}
              aria-label="Delivery state"
              onChange={(e) => editDelivery("state", e.target.value)}
            />
          </Field>

          {/* Stacked full-width on mobile: two side-by-side 16px-bold labels
              wrapped onto two lines at 320px. `md:` restores the original
              justify-between row, so desktop is unchanged. */}
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:justify-between">
            <Button href="/cart" variant="secondary" className="w-full md:w-auto">
              Back to Cart
            </Button>
            <Button variant="primary" onClick={handleContinueStep1} className="w-full md:w-auto">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* ---- STEP 2: Payment method ---- */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="font-sans">
            Choose how you would like to pay. Nothing is charged — this is a
            demo.
          </p>

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setPayment("paystack")}
              aria-pressed={payment === "paystack"}
              className={
                "flex items-center gap-4 rounded-xl p-4 text-left transition-all shadow-soft hover:shadow-soft-hover " +
                (payment === "paystack"
                  ? "bg-accent text-black"
                  : "bg-white text-black border border-line")
              }
            >
              <CardIcon />
              <span className="font-sans font-bold uppercase tracking-wide">
                Pay with Paystack
              </span>
            </button>

            <button
              type="button"
              onClick={() => setPayment("transfer")}
              aria-pressed={payment === "transfer"}
              className={
                "flex items-center gap-4 rounded-xl p-4 text-left transition-all shadow-soft hover:shadow-soft-hover " +
                (payment === "transfer"
                  ? "bg-accent text-black"
                  : "bg-white text-black border border-line")
              }
            >
              <BankIcon />
              <span className="font-sans font-bold uppercase tracking-wide">
                Bank Transfer
              </span>
            </button>
          </div>

          {payment === "transfer" && (
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="font-sans text-xs uppercase tracking-wide text-black/50">
                Transfer to
              </p>
              <dl className="mt-2 flex flex-col gap-1 font-sans text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-black/60">Bank</dt>
                  <dd className="font-semibold">{BUSINESS.bank.bankName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-black/60">Account name</dt>
                  <dd className="font-semibold">{BUSINESS.bank.accountName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-black/60">Account number</dt>
                  <dd className="font-mono font-semibold">
                    {BUSINESS.bank.accountNumber}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 font-sans text-[11px] leading-relaxed text-black/50">
                Send only to this account. A transfer screenshot is not a
                confirmed payment until the funds are verified, and your order
                is processed after verification.
              </p>
            </div>
          )}

          {/* Mobile order summary — the fee is only knowable once a state exists. */}
          <div className="rounded-xl border border-line bg-white p-4 md:hidden">
            <h2 className="font-sans text-xs uppercase tracking-wide text-black/50">
              Order summary
            </h2>
            <div className="mt-2 flex flex-col gap-1 font-sans text-sm">
              <div className="flex justify-between">
                <span className="text-black/60">
                  Items ({lines.length})
                </span>
                <PriceTag price={subtotal} tone="shell" size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">
                  Delivery · {delivery.state} · zone {quote.zone}
                </span>
                <PriceTag price={quote.fee} tone="shell" size="sm" />
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-line pt-2 font-bold">
                <span>Total</span>
                <PriceTag price={total} tone="shell" />
              </div>
            </div>
          </div>

          {placeError && (
            <p
              role="alert"
              className="rounded-xl border-2 border-black bg-white p-4 font-sans text-sm leading-relaxed"
            >
              {placeError}
            </p>
          )}

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:justify-between">
            <Button variant="secondary" onClick={() => setStep(1)} className="w-full md:w-auto">
              Back
            </Button>
            <Button
              variant="primary"
              disabled={!payment || placing}
              onClick={() => void handlePlaceOrder()}
              className="w-full md:w-auto"
            >
              {placing ? "Placing order…" : "Place Order"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
