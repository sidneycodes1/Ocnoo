import type { Metadata } from "next";
import { privateMeta } from "@/lib/site";

// The Account screen is a client component (it reads the saved and order
// counts), so its title lives here. This layout also covers every route under
// /account (addresses, edit-profile, connections), and all of them render this
// browser's own data - hence the noindex, which children inherit.
export const metadata: Metadata = privateMeta("Account");

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
