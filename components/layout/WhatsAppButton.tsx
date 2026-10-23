import Button from "@/components/ui/Button";
import { WHATSAPP_LINK } from "@/lib/business";

// Real WhatsApp chat intent: desktop opens WhatsApp Web, mobile opens the app.
// The number comes from lib/business.ts so it is defined exactly once.

export function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91C21.86 6.45 17.49 2 12.04 2Zm5.8 14.05c-.24.68-1.42 1.31-1.96 1.36-.5.05-1.14.07-1.84-.11-.42-.11-.96-.29-1.65-.59-2.9-1.25-4.79-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99 0-1.42.75-2.12 1.02-2.41.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.14-.28.29-.14.57.14.28.64 1.05 1.37 1.71.94.84 1.74 1.1 2.02 1.24.28.14.44.12.6-.07.16-.19.7-.81.88-1.09.19-.28.37-.24.63-.14.26.09 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

interface WhatsAppButtonProps {
  label?: string;
  iconOnly?: boolean;
  /** App-shell presentation: blue outline pill, sentence case. Implied by `iconOnly`. */
  mobile?: boolean;
  className?: string;
}

// Composed from the Button primitive so it inherits the exact design tokens.
//
// `iconOnly` is used by the mobile action bar, where the labelled desktop form
// would be too wide: it becomes a fixed 44px outline circle. The label is still
// exposed as the accessible name. Nothing about the labelled desktop call sites
// changes unless `mobile`/`iconOnly` is asked for.
export default function WhatsAppButton({
  label = "Chat on WhatsApp",
  iconOnly = false,
  mobile = false,
  className = "",
}: WhatsAppButtonProps) {
  const shell = mobile || iconOnly;
  return (
    <Button
      href={WHATSAPP_LINK}
      variant={shell ? "secondary" : "primary"}
      tone={shell ? "primary" : "default"}
      shape={shell ? "pill" : "md"}
      labelCase={shell ? "none" : "upper"}
      padding={iconOnly ? "square" : "normal"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`gap-2 ${className}`}
    >
      <WhatsAppIcon size={iconOnly ? 20 : 22} />
      {!iconOnly && <span>{label}</span>}
    </Button>
  );
}
