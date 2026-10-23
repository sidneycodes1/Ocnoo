import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// Client page (reads CartContext + the address book), and a checkout screen has
// no business being in a search index under any circumstances.
export const metadata: Metadata = privateMeta("Checkout");

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
