import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import {
  AccountIcon,
  BookmarkIcon,
  MessagesIcon,
  NotificationsIcon,
} from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Account — OCNOO Online Store",
};

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
  return (
    <div className="mx-auto max-w-3xl animate-fade-in px-4 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface text-black/50">
          <AccountIcon size={40} />
        </div>
        <h1 className="font-sans text-2xl font-extrabold uppercase tracking-tight">
          Account
        </h1>
        <p className="font-sans text-sm text-black/60">
          You are browsing as a guest. This is a demo — there is no real sign-in.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
  );
}
