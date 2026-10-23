import type { Metadata } from "next";
import EmptyState from "@/components/pages/EmptyState";
import { privateMeta } from "@/lib/site";
import { NotificationsIcon } from "@/components/ui/icons";

export const metadata: Metadata = privateMeta("Notifications");

export default function NotificationsPage() {
  return (
    <EmptyState
      icon={<NotificationsIcon size={40} />}
      title="Notifications"
      description="You don't have any notifications right now."
    />
  );
}
