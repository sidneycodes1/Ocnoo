import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "highlight";

// Shared look: rounded corners, soft diffused shadow that lifts on hover.
// No press/translate physics anymore (also keeps position:fixed children safe).
// NOTE: no hex/shadow literals here — all via Tailwind design tokens.
const base =
  "inline-flex items-center justify-center min-h-[44px] px-5 py-2 " +
  "rounded-md font-sans font-bold uppercase tracking-wide " +
  "shadow-soft transition-all duration-150 ease-out hover:shadow-soft-hover " +
  "focus:outline-none " +
  "disabled:bg-disabled disabled:text-black/40 disabled:shadow-none disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-black text-white",
  secondary: "bg-white text-black border border-line",
  highlight: "bg-accent text-black",
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
    // Strip className/variant/children from `rest` BEFORE spreading, otherwise
    // the caller's className overrides the merged base+variant classes and the
    // `variant` prop leaks to the DOM as an invalid attribute.
    const { href, variant: _v, className: _c, children: _ch, ...rest } = props;
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
