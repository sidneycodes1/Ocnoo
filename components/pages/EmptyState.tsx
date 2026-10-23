import type { ReactNode } from "react";
import Button from "@/components/ui/Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: { label: string; href: string };
}

// Centered placeholder panel used by the demo account-cluster pages.
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-md animate-fade-in flex-col items-center gap-4 px-4 py-20 text-center">
      {icon && (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-black/40">
          {icon}
        </div>
      )}
      {/* Title is announced on mobile (the screen header shows it visually);
          from md up it is the visible heading again. */}
      <h1 className="font-sans text-2xl font-extrabold uppercase tracking-tight sr-only md:not-sr-only">
        {title}
      </h1>
      {description && (
        <p className="font-sans text-base leading-relaxed text-black/70">
          {description}
        </p>
      )}
      {action && (
        <Button href={action.href} variant="primary" className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  );
}
