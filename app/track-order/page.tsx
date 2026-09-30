"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

const STEPS = ["Order Placed", "Packed", "Dispatched", "Delivered"];
// Demo timeline: the first two steps are "complete".
const COMPLETED_COUNT = 2;

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [result, setResult] = useState<"idle" | "found" | "notfound">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Any non-empty input is treated as a found order (no real backend).
    setResult(orderNumber.trim() === "" ? "notfound" : "found");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 font-sans text-3xl font-extrabold uppercase tracking-tight">
        Track Your Order
      </h1>
      <p className="mb-6 font-sans">
        Enter the order number from your confirmation (e.g. OCN-12345).
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1">
          <span className="font-sans text-sm font-bold uppercase tracking-wide">
            Order Number
          </span>
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="OCN-00000"
          />
        </label>
        <Button type="submit" variant="primary">
          Track
        </Button>
      </form>

      {result === "notfound" && (
        <p className="mt-6 bg-surface rounded-xl shadow-soft p-4 font-sans font-bold">
          We couldn&apos;t find that order.
        </p>
      )}

      {result === "found" && (
        <Card className="mt-6 p-6">
          <p className="mb-4 font-sans text-sm uppercase tracking-wide">
            Status for <span className="font-bold">{orderNumber.trim()}</span>
          </p>
          <ol className="flex flex-col">
            {STEPS.map((step, i) => {
              const done = i < COMPLETED_COUNT;
              return (
                <li key={step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line " +
                        (done ? "bg-black text-white" : "bg-white")
                      }
                      aria-hidden="true"
                    >
                      {done ? "✓" : ""}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className="my-1 w-0.5 flex-1 bg-black" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-sans text-sm font-bold uppercase">
                      {step}
                    </p>
                    <p className="font-sans text-xs">
                      {done ? "Completed" : "Pending"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>
      )}
    </div>
  );
}
