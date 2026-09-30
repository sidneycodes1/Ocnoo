"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatNaira, generateOrderNumber } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

const NG_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

type PaymentMethod = "paystack" | "transfer";

interface Delivery {
  name: string;
  phone: string;
  address: string;
  state: string;
}

interface OrderSnapshot {
  orderNumber: string;
  lines: { name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  delivery: Delivery;
  payment: PaymentMethod;
}

const emptyDelivery: Delivery = { name: "", phone: "", address: "", state: "" };

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
      {error && (
        <span className="font-sans text-sm font-bold">Required field.</span>
      )}
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

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [delivery, setDelivery] = useState<Delivery>(emptyDelivery);
  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [order, setOrder] = useState<OrderSnapshot | null>(null);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center font-sans">
        Loading checkout…
      </div>
    );
  }

  // ---- Step 3: confirmation (rendered from the snapshot, cart already cleared)
  if (step === 3 && order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <Card className="p-6 md:p-8">
          <h1 className="font-sans text-3xl font-extrabold uppercase">
            Thank you!
          </h1>
          <p className="mt-2 font-sans">
            Your order has been received. This is a demo — no payment was taken
            and nothing was actually sold.
          </p>

          <div className="mt-6 bg-surface rounded-xl p-4">
            <p className="font-sans text-sm uppercase tracking-wide">
              Order number
            </p>
            <p className="font-mono text-2xl font-bold">{order.orderNumber}</p>
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
            <div className="mt-2 flex justify-between border-t-2 border-black pt-2 font-sans font-bold">
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

  const fieldsValid =
    delivery.name.trim() !== "" &&
    delivery.phone.trim() !== "" &&
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

  function handlePlaceOrder() {
    if (!payment) return;
    const snapshot: OrderSnapshot = {
      orderNumber: generateOrderNumber(),
      lines: lines.map((l) => ({
        name: l.product.name,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
      })),
      subtotal,
      delivery,
      payment,
    };
    setOrder(snapshot);
    clearCart();
    setStep(3);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 font-sans text-3xl font-extrabold uppercase tracking-tight">
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
          <Field label="Full name" error={attempted && !delivery.name.trim() ? "req" : undefined}>
            <Input
              value={delivery.name}
              onChange={(e) => setDelivery({ ...delivery, name: e.target.value })}
              placeholder="e.g. Ada Obi"
            />
          </Field>

          <Field label="Phone" error={attempted && !delivery.phone.trim() ? "req" : undefined}>
            <Input
              type="tel"
              value={delivery.phone}
              onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })}
              placeholder="e.g. 08000000000"
            />
          </Field>

          <Field label="Delivery address" error={attempted && !delivery.address.trim() ? "req" : undefined}>
            <Input
              value={delivery.address}
              onChange={(e) => setDelivery({ ...delivery, address: e.target.value })}
              placeholder="Street, city"
            />
          </Field>

          <Field label="State" error={attempted && !delivery.state ? "req" : undefined}>
            <select
              value={delivery.state}
              onChange={(e) => setDelivery({ ...delivery, state: e.target.value })}
              className="w-full min-h-[44px] rounded-md border border-line bg-white px-3 py-2 font-sans focus:border-accent focus:ring-2 focus:ring-accent/40 focus:outline-none"
            >
              <option value="">Select a state…</option>
              {NG_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <div className="mt-2 flex justify-between gap-3">
            <Button href="/cart" variant="secondary">
              Back to Cart
            </Button>
            <Button variant="primary" onClick={handleContinueStep1}>
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

          <div className="mt-2 flex justify-between gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="primary" disabled={!payment} onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
