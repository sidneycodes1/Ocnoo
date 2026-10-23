import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// /cart reads CartContext, so it is a client page and cannot export metadata
// itself. The cart is also this browser's own - nothing here is worth crawling.
export const metadata: Metadata = privateMeta("Your Cart");

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
