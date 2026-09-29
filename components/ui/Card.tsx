import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// White surface, 2px black border, hard shadow, zero radius, press physics on hover.
// Tokens only — no hex/shadow literals.
export default function Card({
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={
        "bg-white border-2 border-black rounded-none shadow-hard " +
        "transition-all duration-100 ease-out " +
        "hover:shadow-hard-hover hover:-translate-x-[2px] hover:-translate-y-[2px] " +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
