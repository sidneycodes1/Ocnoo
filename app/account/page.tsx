"use client";

import Link from "next/link";
import { useSaved } from "@/context/SavedContext";
import { useOrders } from "@/context/OrdersContext";
import { useAddresses } from "@/context/AddressesContext";
import { useConnections } from "@/context/ConnectionsContext";
import AccountRail from "@/components/account/AccountRail";
import ProfileCard from "@/components/account/ProfileCard";
import ContactMenu from "@/components/layout/ContactMenu";
import Card from "@/components/ui/Card";
import SettingsGroup from "@/components/ui/SettingsGroup";
import {
  AccountIcon,
  BagIcon,
  BookmarkIcon,
  CameraIcon,
  ClockIcon,
  GridIcon,
  MessagesIcon,
  NotificationsIcon,
  PaymentIcon,
  PinIcon,
  ShareIcon,
  ShieldIcon,
} from "@/components/ui/icons";

// Desktop keeps the original three-card layout unchanged.
const SECTIONS = [
  {
    href: "/saved",
    label: "Saved",
    desc: "Items you bookmark for later.",
    icon: <BookmarkIcon size={24} />,
  },
  {
    href: "/messages",
    label: "Messages",
    desc: "Chats about your orders and enquiries.",
    icon: <MessagesIcon size={24} />,
  },
  {
    href: "/notifications",
    label: "Notifications",
    desc: "Updates on your orders and account.",
    icon: <NotificationsIcon size={24} />,
  },
];

export default function AccountPage() {
  const { count: savedCount, hydrated: savedHydrated } = useSaved();
  const { orders, hydrated: ordersHydrated } = useOrders();
  const { addresses, hydrated: addressesHydrated } = useAddresses();
  const { connections, hydrated: connectionsHydrated } = useConnections();

  const savedLabel = savedHydrated && savedCount > 0 ? `Saved (${savedCount})` : "Saved";
  const ordersLabel =
    ordersHydrated && orders.length > 0 ? `My Purchases (${orders.length})` : "My Purchases";
  const addressesLabel =
    addressesHydrated && addresses.length > 0
      ? `Address Book (${addresses.length})`
      : "Address Book";
  const connectionsLabel =
    connectionsHydrated && connections.length > 0
      ? `Connections (${connections.length})`
      : "Connections";

  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-10 md:max-w-5xl">
      <h1 className="font-sans text-2xl font-extrabold uppercase tracking-tight sr-only md:not-sr-only">
        Account
      </h1>

      {/* Desktop gains the reference dashboard's left rail; the identity card
          replaces the old generic avatar. Mobile keeps its single column. */}
      <div className="mt-6 md:grid md:grid-cols-[16rem_minmax(0,1fr)] md:items-start md:gap-6">
        <AccountRail />

        <div className="md:col-start-2 md:row-start-1 md:flex md:flex-col md:gap-6">
          <ProfileCard />

          {/* ---- Mobile: grouped chevron list ---- */}
          <div className="mt-6 flex flex-col gap-6 md:hidden">
            <div className="flex items-center gap-2 px-1">
              <Link
                href="/account/edit-profile"
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white font-sans text-sm font-semibold active:bg-page"
              >
                <AccountIcon size={18} />
                Edit Profile
              </Link>
              <span className="h-6 w-px bg-line" aria-hidden="true" />
              <Link
                href="/messages"
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-white font-sans text-sm font-semibold active:bg-page"
              >
                <MessagesIcon size={18} />
                Messages
              </Link>
            </div>

            <SettingsGroup
              title="My shop"
              links={[
                { label: ordersLabel, href: "/purchases", icon: <BagIcon size={20} /> },
                { label: savedLabel, href: "/saved", icon: <BookmarkIcon size={20} /> },
                { label: "Track Order", href: "/track-order", icon: <ClockIcon size={20} /> },
              ]}
            />

            <SettingsGroup
              title="Delivery"
              links={[
                {
                  label: addressesLabel,
                  href: "/account/addresses",
                  icon: <PinIcon size={20} />,
                },
              ]}
            />

            <SettingsGroup
              title="Selling"
              links={[
                { label: "Post an Ad", href: "/sell", icon: <CameraIcon size={20} /> },
                { label: "My Ads", href: "/my-ads", icon: <GridIcon size={20} /> },
                {
                  label: connectionsLabel,
                  href: "/account/connections",
                  icon: <ShareIcon size={20} />,
                },
              ]}
            />

            <SettingsGroup
              title="Payments & privacy"
              links={[
                { label: "Billing Policy", href: "/about/billing-policy", icon: <PaymentIcon size={20} /> },
                { label: "Privacy Policy", href: "/about/privacy", icon: <ShieldIcon size={20} /> },
              ]}
            />

            <SettingsGroup
              links={[
                { label: "Wholesale", href: "/wholesale" },
                { label: "Become a Reseller", href: "/become-a-reseller" },
                { label: "Safety Tips", href: "/safety-tips" },
                { label: "FAQ", href: "/faq" },
                { label: "Terms & Conditions", href: "/about/terms" },
                { label: "Copyright Policy", href: "/about/copyright-policy" },
              ]}
            />

            {/* Same disclosure the desktop rail carries. It closes on its own and
                needs no click-outside handler, so it is safe as a list row. */}
            <div className="border-y border-line bg-white">
              <ContactMenu variant="row" />
            </div>
          </div>

          {/* ---- Desktop: unchanged ---- */}
          <div className="mt-8 hidden gap-4 sm:grid-cols-3 md:grid">
            {SECTIONS.map((s) => (
              <Link key={s.href} href={s.href} className="block">
                <Card className="flex h-full flex-col gap-2 p-5">
                  <span className="text-black">{s.icon}</span>
                  <h2 className="font-sans text-base font-extrabold uppercase">
                    {s.label}
                  </h2>
                  <p className="font-sans text-sm text-black/60">{s.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
