import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "highlight";
/** `md` is the original 8px-token shape; `pill` is the mobile app-shell shape. */
type Shape = "md" | "pill";
/** `default` = the black/white/accent desktop palette. `primary` = the mobile blue. */
type Tone = "default" | "primary";
/** Horizontal rhythm. `tight`/`square` exist for crowded mobile bars. */
type Padding = "normal" | "tight" | "square";

// The class string is assembled from segments so that a call site passing no
// new props gets a byte-identical string to the pre-mobile-shell version:
//   structural + padding + shape + type + case + elevation + variant + className.
// Never append an override (`!rounded-full`) — extend a segment instead.
const structural = "inline-flex items-center justify-center min-h-[44px] ";

// Padding is a segment, not an appended `px-0`: Tailwind orders utilities by
// the spacing scale, so an appended `px-0` would lose to the base `px-5`.
const paddings: Record<Padding, string> = {
  normal: "px-5 py-2 ",
  tight: "px-3 py-2 ",
  // Icon-only control: fixed square so it cannot be squeezed by neighbours.
  square: "w-11 shrink-0 px-0 ",
};

const type = "font-sans font-bold ";

// Elevation is CHOSEN per tone, never appended: `shadow-soft` lives in
// `extend.boxShadow` so it is emitted after the default `shadow-none`, which
// means an appended `shadow-none` would silently lose to it.
const elevations = {
  default:
    "shadow-soft transition-all duration-150 ease-out hover:shadow-soft-hover " +
    "focus:outline-none " +
    "disabled:bg-disabled disabled:text-black/40 disabled:shadow-none disabled:cursor-not-allowed",
  // Mobile app-shell buttons are flat, like the reference.
  primary:
    "shadow-none transition-all duration-150 ease-out hover:shadow-none " +
    "focus:outline-none " +
    "disabled:bg-disabled disabled:text-black/40 disabled:cursor-not-allowed",
} as const;

const shapes: Record<Shape, string> = {
  md: "rounded-md ",
  pill: "rounded-full ",
};

// `upper` is what every existing button renders as today.
const cases = {
  upper: "uppercase tracking-wide ",
  none: "",
} as const;
type LabelCase = keyof typeof cases;

const tones: Record<Tone, Record<Variant, string>> = {
  default: {
    primary: "bg-black text-white",
    secondary: "bg-white text-black border border-line",
    highlight: "bg-accent text-black",
  },
  // Mobile app-shell: blue solid / blue outline. The outline variant is the
  // reference's secondary pill ("Add to Cart").
  primary: {
    primary: "bg-primary text-white",
    secondary: "bg-white text-primary border border-primary",
    highlight: "bg-primary text-white",
  },
};

interface ButtonAsButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
  variant?: Variant;
  shape?: Shape;
  tone?: Tone;
  labelCase?: LabelCase;
  padding?: Padding;
  children: ReactNode;
}

interface ButtonAsLink extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  shape?: Shape;
  tone?: Tone;
  labelCase?: LabelCase;
  padding?: Padding;
  children: ReactNode;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    shape = "md",
    tone = "default",
    labelCase = "upper",
    padding = "normal",
    className = "",
    children,
  } = props;

  const classes =
    structural +
    paddings[padding] +
    shapes[shape] +
    type +
    cases[labelCase] +
    elevations[tone] +
    " " +
    tones[tone][variant] +
    " " +
    className;

  if (props.href !== undefined) {
    // Strip className/variant/children from `rest` BEFORE spreading, otherwise
    // the caller's className overrides the merged base+variant classes and the
    // `variant` prop leaks to the DOM as an invalid attribute.
    const {
      href,
      variant: _v,
      shape: _s,
      tone: _t,
      labelCase: _lc,
      padding: _p,
      className: _c,
      children: _ch,
      ...rest
    } = props;
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    shape: _s,
    tone: _t,
    labelCase: _lc,
    padding: _p,
    className: _c,
    children: _ch,
    ...rest
  } = props;
  return (
    // `type="button"` is the default, not the HTML default. A bare <button>
    // inside a <form> is a SUBMIT, and it is also the implicit target of the
    // Enter key - so a secondary action like "Cancel" or "Back to Address Book"
    // that omitted `type` both fired the form's onSubmit and, being the first
    // submit button in the document, hijacked Enter. Every real submit here
    // already says `type="submit"` explicitly, and `{...rest}` after this still
    // lets a call site override it.
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
