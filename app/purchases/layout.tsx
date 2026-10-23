import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// The Purchases screen is a client component (it reads OrdersContext), so its
// title lives here. Order history is this browser's own, so noindex as well.
export const metadata: Metadata = privateMeta("My Purchases");

export default function PurchasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
