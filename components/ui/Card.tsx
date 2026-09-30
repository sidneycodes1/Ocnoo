import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// White surface, rounded corners, soft diffused shadow that lifts on hover.
// Tokens only — no hex/shadow literals.
export default function Card({
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={
        "bg-white rounded-xl shadow-soft " +
        "transition-all duration-150 ease-out hover:shadow-soft-hover " +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
