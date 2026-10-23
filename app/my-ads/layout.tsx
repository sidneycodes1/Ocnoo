import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// The list of ads THIS browser posted. Client page, and meaningless to anyone
// else who opens it.
export const metadata: Metadata = privateMeta("My Ads");

export default function MyAdsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
