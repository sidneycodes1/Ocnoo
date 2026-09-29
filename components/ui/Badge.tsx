import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
}

// Solid black background, white text. Used for New / Deal / Pre-Order.
// No color, no shadow — pure token-based fill.
export default function Badge({
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={
        "inline-block bg-black text-white rounded-none " +
        "px-2 py-0.5 text-xs font-bold uppercase tracking-wide " +
        className
      }
      {...props}
    >
      {children}
    </span>
  );
}
