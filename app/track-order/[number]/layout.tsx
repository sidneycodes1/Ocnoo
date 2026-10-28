import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// Covers /track-order/[number] and /track-order/[number]/history. The `?t=`
// key in the URL is a bearer token - whoever has the link sees the order - so
// these pages must never be cached by a crawler or served from its index.
// robots.txt already disallows /track-order/; this is the second lock.
export const metadata: Metadata = privateMeta("Order Status");

export default function OrderStatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}
