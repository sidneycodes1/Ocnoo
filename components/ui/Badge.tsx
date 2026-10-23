import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

// Solid ink background with card-white text by default; pass bg-accent via
// className for a highlight (e.g. Deal). Rounded, token-based fill.
export default function Badge({
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={
        "inline-block bg-black text-white rounded-md " +
        "px-2 py-0.5 text-xs font-bold uppercase tracking-wide " +
        className
      }
      {...props}
    >
      {children}
    </span>
  );
}
