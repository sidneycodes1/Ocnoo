"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS, activeTab, showTabBar } from "@/lib/nav";
import {
  AccountIcon,
  GridIcon,
  HomeIcon,
  NotificationsIcon,
  PlusIcon,
} from "@/components/ui/icons";

const ICONS: Record<string, (p: { size?: number }) => JSX.Element> = {
  discover: HomeIcon,
  categories: GridIcon,
  sell: PlusIcon,
  notifications: NotificationsIcon,
  profile: AccountIcon,
};

// Five-slot bar with the centre "Sell" action raised over its top edge, which
// is how the reference gives the listing flow prominence without a modal.
export default function TabBar() {
  const pathname = usePathname();
  const active = activeTab(pathname);

  // Product detail and checkout own the bottom edge with their own action bar.
  if (!showTabBar(pathname)) return null;

  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-safe md:hidden"
    >
      <ul className="mx-auto grid max-w-6xl grid-cols-5">
        {TABS.map((tab) => {
          const Icon = ICONS[tab.key];
          const isSell = tab.key === "sell";
          const isActive = active === tab.key;

          if (isSell) {
            return (
              <li key={tab.key} className="flex justify-center">
                <Link
                  href={tab.href}
                  className="-mt-6 flex flex-col items-center gap-1"
                  aria-label="Sell an item"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-soft">
                    <Icon size={22} />
                  </span>
                  <span className="font-sans text-[10px] font-semibold text-primary">
                    {tab.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex h-14 flex-col items-center justify-center gap-1 ${
                  isActive ? "text-primary" : "text-black/70"
                }`}
              >
                <Icon size={22} />
                <span className="font-sans text-[10px] font-semibold">
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
