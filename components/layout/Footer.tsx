import Link from "next/link";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "About us",
    links: [
      { label: "About OCNOO", href: "/about" },
      { label: "Terms & Conditions", href: "/about/terms" },
      { label: "Privacy Policy", href: "/about/privacy" },
      { label: "Billing Policy", href: "/about/billing-policy" },
      { label: "Copyright Infringement Policy", href: "/about/copyright-policy" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "Shop", href: "/shop" },
      { label: "Wholesale", href: "/wholesale" },
      { label: "Become a Reseller", href: "/become-a-reseller" },
      { label: "Track Order", href: "/track-order" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Safety Tips", href: "/safety-tips" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

// Placeholder social handles — swap the "#" hrefs for real profiles.
const SOCIALS = [
  { label: "Instagram", href: "#", icon: <InstagramIcon /> },
  { label: "Facebook", href: "#", icon: <FacebookIcon /> },
  { label: "X (Twitter)", href: "#", icon: <XIcon /> },
  { label: "WhatsApp", href: "https://wa.me/2348000000000", icon: <WhatsAppIcon size={20} /> },
];

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7h2.4l.4-2.8h-2.8V9.4c0-.8.2-1.4 1.4-1.4h1.5V5.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.1H7.6V14h2.2v7h3.7z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L5.9 22H2.8l7.5-8.6L2 2h6.6l4.6 6.8L18.9 2zm-1.1 18h1.8L7.3 3.9H5.4L17.8 20z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white pb-[96px] md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="mb-4 font-sans text-sm font-extrabold uppercase tracking-wide">
              {col.title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-black/70 transition-colors hover:text-black hover:underline hover:underline-offset-4"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <p className="mb-4 font-sans text-sm font-extrabold uppercase tracking-wide">
            Connect with us
          </p>
          <div className="flex gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-black transition-colors hover:border-accent hover:bg-accent"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center font-sans text-xs uppercase tracking-wide text-black/60">
          © {new Date().getFullYear()} OCNOO
        </p>
      </div>
    </footer>
  );
}
