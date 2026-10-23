import type { Metadata } from "next";
import AccountShell from "@/components/account/AccountShell";
import ConnectionsPanel from "@/components/account/ConnectionsPanel";

export const metadata: Metadata = {
  title: "Connections — OCNOO Online Store",
};

export default function ConnectionsPage() {
  return (
    <AccountShell>
      {/* The mobile screen header already carries the title. */}
      <h1 className="sr-only font-sans text-2xl font-extrabold uppercase tracking-tight md:not-sr-only">
        Connections
      </h1>
      <p className="mt-1 font-sans text-sm text-black/60 md:mt-2">
        The social accounts you want shown on your listings, so a buyer can look
        you up on your Instagram or X before they pay.
      </p>
      <div className="mt-5">
        <ConnectionsPanel />
      </div>
    </AccountShell>
  );
}
