import type { Metadata } from "next";
import Link from "next/link";
import EmptyState from "@/components/pages/EmptyState";
import { MessagesIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Messages — OCNOO Online Store",
};

export default function MessagesPage() {
  return (
    <EmptyState
      icon={<MessagesIcon size={40} />}
      title="Messages"
      description={
        <>
          You have no messages yet.{" "}
          <Link
            href="/shop"
            className="font-bold text-black underline underline-offset-4"
          >
            Find things
          </Link>{" "}
          to discuss or sell something.
        </>
      }
    />
  );
}
