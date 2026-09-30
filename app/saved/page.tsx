import type { Metadata } from "next";
import EmptyState from "@/components/pages/EmptyState";
import { BookmarkIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Saved — OCNOO Online Store",
};

export default function SavedPage() {
  return (
    <EmptyState
      icon={<BookmarkIcon size={40} />}
      title="My Saved"
      description="It's empty here…"
      action={{ label: "Find anything", href: "/shop" }}
    />
  );
}
