import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary";

// Shared look: 2px black border, zero radius, hard shadow + press physics.
// NOTE: no hex/shadow literals here — all via Tailwind design tokens (Phase 0).
const base =
  "inline-flex items-center justify-center min-h-[44px] px-5 py-2 " +
  "border-2 border-black rounded-none font-sans font-bold uppercase tracking-wide " +
  "shadow-hard transition-all duration-100 ease-out " +
  "hover:shadow-hard-hover hover:-translate-x-[2px] hover:-translate-y-[2px] " +
  "active:shadow-hard-press active:translate-x-[4px] active:translate-y-[4px] " +
  "focus:outline-none " +
  "disabled:bg-disabled disabled:border-black disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-black text-white",
  secondary: "bg-white text-black",
};

interface ButtonAsButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
  variant?: Variant;
  children: ReactNode;
}

interface ButtonAsLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  children: ReactNode;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  const { variant = "primary", className = "", children } = props;
  const classes = `${base} ${variants[variant]} ${className}`;

  if (props.href !== undefined) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, className: _c, children: _ch, ...rest } = props;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
