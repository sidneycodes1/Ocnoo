import type { Metadata } from "next";

// /track-order is a public utility page - an empty form, no user data - so it
// keeps its indexability and only gains the title it was inheriting. The
// order-number pages under it are noindexed in their own layout.
export const metadata: Metadata = {
  title: "Track Your Order — OCNOO Online Store",
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
