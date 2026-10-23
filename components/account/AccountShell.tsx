"use client";

import type { ReactNode } from "react";
import AccountRail from "@/components/account/AccountRail";

/**
 * Frame shared by the pushed screens inside the account area (Edit Profile,
 * Address Book, the address forms). Desktop gets the reference dashboard's
 * left rail; mobile is a single column with no rail, because the Profile tab's
 * chevron list already is that navigation.
 *
 * The width matches the Profile tab (`md:max-w-5xl`) so the content column
 * starts at the same x on every screen and the page does not jog sideways.
 */
export default function AccountShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 pb-8 pt-3 md:max-w-5xl md:py-8">
      <div className="md:grid md:grid-cols-[16rem_minmax(0,1fr)] md:items-start md:gap-6">
        <AccountRail />
        <div className="md:col-start-2 md:row-start-1 md:min-w-0">{children}</div>
      </div>
    </div>
  );
}
