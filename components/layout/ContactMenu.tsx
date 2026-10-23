"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BUSINESS, MAILTO_LINK, TEL_LINK, WHATSAPP_LINK } from "@/lib/business";
import { ChevronDownIcon } from "@/components/ui/icons";

/**
 * The four ways to reach OCNOO that actually exist: WhatsApp and a call on the
 * published number, an email to the published address, and the contact form.
 * Nothing here opens a chat widget or a ticket system the store does not have.
 */
const CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    detail: "Fastest — we reply there",
    href: WHATSAPP_LINK,
    external: true,
  },
  {
    key: "call",
    label: `Call ${BUSINESS.phoneDisplay}`,
    detail: "Mon–Sat, daytime",
    href: TEL_LINK,
    external: false,
  },
  {
    key: "email",
    label: BUSINESS.email,
    detail: "Longer questions, documents",
    href: MAILTO_LINK,
    external: false,
  },
];

function Row({
  href,
  external,
  label,
  detail,
}: {
  href: string;
  external: boolean;
  label: string;
  detail: string;
}) {
  const cls =
    "flex min-h-[44px] flex-col justify-center gap-0.5 px-4 py-2 text-left active:bg-page hover:bg-page";
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      <span className="font-sans text-sm font-semibold">{label}</span>
      <span className="font-sans text-xs text-black/50">{detail}</span>
    </a>
  ) : (
    <a href={href} className={cls}>
      <span className="font-sans text-sm font-semibold">{label}</span>
      <span className="font-sans text-xs text-black/50">{detail}</span>
    </a>
  );
}

interface ContactMenuProps {
  /** `pill` is a bordered button, `row` matches the account chevron list. */
  variant?: "pill" | "row";
  className?: string;
}

/**
 * A disclosure, not a modal. Built on <details> for the same reason the header's
 * sort menu is: it closes on its own without any click-outside listener, and it
 * works before hydration.
 */
export default function ContactMenu({
  variant = "pill",
  className = "",
}: ContactMenuProps) {
  const pathname = usePathname();
  // On the contact page itself the dropdown is redundant.
  if (pathname === "/contact") return null;

  const trigger =
    variant === "row"
      ? "flex min-h-[52px] w-full items-center gap-3 px-4 font-sans text-sm font-semibold"
      : "flex min-h-[44px] items-center gap-2 rounded-xl border border-line bg-white px-4 font-sans text-sm font-semibold";

  return (
    <details className={`relative ${className}`}>
      <summary
        className={`cursor-pointer list-none [&::-webkit-details-marker]:hidden ${trigger}`}
        aria-label="Contact OCNOO"
      >
        <span className="flex-1 text-left">Contact us</span>
        <ChevronDownIcon size={16} className="shrink-0 text-black/40" />
      </summary>

      <ul className="absolute left-0 right-0 top-full z-40 overflow-hidden rounded-xl border border-line bg-white py-1 shadow-soft-hover md:right-auto md:w-72">
        {CHANNELS.map((c) => (
          <li key={c.key}>
            <Row
              href={c.href}
              external={c.external}
              label={c.label}
              detail={c.detail}
            />
          </li>
        ))}
        <li className="border-t border-line">
          <Link
            href="/contact"
            className="flex min-h-[44px] items-center px-4 font-sans text-sm font-semibold hover:bg-page active:bg-page"
          >
            Send a message from the contact form
          </Link>
        </li>
      </ul>
    </details>
  );
}
