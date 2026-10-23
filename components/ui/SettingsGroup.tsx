import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/icons";

export interface SettingsLink {
  label: string;
  href: string;
  icon?: ReactNode;
}

interface SettingsGroupProps {
  /** Small uppercase group caption, e.g. "MY ACCOUNT". */
  title?: string;
  links: SettingsLink[];
  className?: string;
}

// Grouped chevron list from the reference Profile screen.
export default function SettingsGroup({
  title,
  links,
  className = "",
}: SettingsGroupProps) {
  return (
    <section className={className}>
      {title && (
        <h2 className="px-4 pb-2 pt-5 font-sans text-xs uppercase tracking-wide text-black/40">
          {title}
        </h2>
      )}
      <ul className="border-y border-line bg-white">
        {links.map((link, i) => (
          <li key={link.href + link.label} className={i > 0 ? "border-t border-line" : ""}>
            <Link
              href={link.href}
              className="flex min-h-[52px] items-center gap-3 px-4 font-sans text-sm font-semibold active:bg-page"
            >
              {link.icon && <span className="text-black/60">{link.icon}</span>}
              <span className="flex-1">{link.label}</span>
              <ChevronRightIcon size={18} className="text-black/30" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
