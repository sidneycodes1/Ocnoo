import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// Overrides the "Post an Ad" title inherited from app/sell/layout.tsx for this
// one route; the noindex is inherited unchanged.
export const metadata: Metadata = privateMeta("Edit Ad");

export default function EditListingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
