import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * Mobile app-shell surface: 1px hairline border and no elevation, which is
   * how the reference cards read against the `page` tint. Defaults to the
   * existing shadow-soft surface so every current call site is unchanged.
   */
  bordered?: boolean;
}

// Card surface. The card tone (#F7F7F7) sits only ~3 L* above the page canvas
// (#F4F6F5), so the hairline border is what actually separates the two - it is
// on both variants, and `bordered` additionally drops the elevation.
export default function Card({
  className = "",
  children,
  bordered = false,
  ...props
}: CardProps) {
  const surface = bordered
    ? "bg-white rounded-xl border border-line shadow-none "
    : "bg-white rounded-xl border border-line shadow-soft ";

  return (
    <div
      className={
        surface +
        "transition-all duration-150 ease-out hover:shadow-soft-hover " +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
