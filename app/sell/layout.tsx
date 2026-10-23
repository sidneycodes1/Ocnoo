import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// Covers /sell and, unless overridden below it, /sell/[id]. The composer is a
// client page (it reads and writes ListingsContext) and holds no published
// content, so it is titled here and kept out of the index.
export const metadata: Metadata = privateMeta("Post an Ad");

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return children;
}
