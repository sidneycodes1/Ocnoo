import type { Metadata } from "next";
import EmptyState from "@/components/pages/EmptyState";
import { NotificationsIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Notifications — OCNOO Online Store",
};

export default function NotificationsPage() {
  return (
    <EmptyState
      icon={<NotificationsIcon size={40} />}
      title="Notifications"
      description="You don't have any notifications right now."
    />
  );
}
