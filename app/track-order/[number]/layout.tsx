import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// Covers /track-order/[number] and /track-order/[number]/history. An order
// number is a bearer token in this build - whoever has the link sees the
// contents - so these must never be cached by a crawler or served from its
// index. robots.txt already disallows /track-order/; this is the second lock.
export const metadata: Metadata = privateMeta("Order Status");

export default function OrderStatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
