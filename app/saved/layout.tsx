import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// The Saved page is a client component (it reads SavedContext), so its title
// lives here instead. It lists this browser's saved items, so it stays out of
// the index too.
export const metadata: Metadata = privateMeta("Saved");

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
