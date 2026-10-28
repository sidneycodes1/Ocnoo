import Link from "next/link";
import { WhatsAppIcon } from "@/components/layout/WhatsAppButton";
import { FacebookIcon, InstagramIcon } from "@/components/ui/icons";
import { BUSINESS, WHATSAPP_LINK } from "@/lib/business";

// Every href below is a route that exists in this app. The reference footer this
// structure came from also listed Careers, Blog, Gift Cards and New Arrivals -
// there is nowhere for those to go here, so they were left out rather than
// pointed at a placeholder.
const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Wholesale", href: "/wholesale" },
      { label: "Become a Reseller", href: "/become-a-reseller" },
      { label: "Track Your Order", href: "/track-order" },
    ],
  },
  {
    title: "Customer Service",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Safety Tips", href: "/safety-tips" },
      { label: "Billing & Payments", href: "/about/billing-policy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About OCNOO", href: "/about" },
      { label: "Terms & Conditions", href: "/about/terms" },
      { label: "Privacy Policy", href: "/about/privacy" },
      { label: "Copyright Policy", href: "/about/copyright-policy" },
    ],
  },
];

// Three profiles, because those are the three that exist. The reference shows
// four circles; inventing an X or YouTube handle would be a dead link.
const SOCIALS = [
  { label: "Instagram", href: BUSINESS.instagram, icon: <InstagramIcon /> },
  { label: "Facebook", href: BUSINESS.facebook, icon: <FacebookIcon /> },
  { label: "WhatsApp", href: WHATSAPP_LINK, icon: <WhatsAppIcon size={20} /> },
];

// Desktop chrome only - the layout hides the whole footer below md, where the
// tab bar owns the bottom edge.
export default function Footer() {
  return (
    <footer className="hidden md:block">
      <div className="bg-charcoal">
        {/* `items-start` matters more than it looks: without it every column is
            stretched to the brand column's height, so the link lists float in a
            taller box than their own content and the leftover space is spread
            invisibly instead of reading as one empty band under the links. */}
        {/* The brand column gets a wider track at lg rather than a quarter of
            the row: "FOLLOW US" plus three 44px circles needs about 257px, and
            an even quarter of a 1152px container leaves ~250px - close enough
            that the icon row drops to its own line. 1.4fr makes it ~318px. */}
        <div className="mx-auto grid max-w-6xl grid-cols-2 items-start gap-10 px-4 py-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-4">
            <span className="font-sans text-2xl font-extrabold uppercase tracking-tight text-on-dark">
              OCNOO
            </span>
            <p className="max-w-[34ch] font-sans text-sm leading-relaxed text-on-dark-muted">
              Quality products at great prices, delivered to you. A trading name
              of King Ocnoo Computer Ventures.
            </p>
            {/* The circles were already here; the reference footer labels them,
                and the label is styled like the column headings beside it.
                On one row rather than stacked, because the brand column being
                58px taller than the link columns is what made the empty band
                under them so wide — the row height is set by the tallest
                column. */}
            {/* The label was wrapping to "FOLLOW / US" because flex was willing
                to squeeze it to its longest word while the icon row kept its
                full intrinsic width. `shrink-0 whitespace-nowrap` on both sides
                makes each element unbreakable, and `flex-wrap` means the pair
                drops to a second line as a unit when the column is genuinely
                too narrow, instead of mangling the words. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <p className="shrink-0 whitespace-nowrap font-sans text-sm font-extrabold uppercase tracking-wide text-on-dark">
                Follow us
              </p>
              <ul className="flex shrink-0 items-center gap-3">
                {SOCIALS.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-on-dark transition-colors hover:border-accent hover:bg-accent hover:text-black"
                    >
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-4 font-sans text-sm font-extrabold uppercase tracking-wide text-on-dark">
                {col.title}
              </p>
              {/* `block py-1` instead of a bare inline link: the inline box was
                  18.5px tall, under the 24px minimum target size, and the block
                  padding also lets the lists sit closer together (gap-0.5)
                  without the links touching. */}
              <ul className="flex flex-col gap-0.5">
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="block py-1 font-sans text-sm text-on-dark-muted transition-colors hover:text-on-dark hover:underline hover:underline-offset-4"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-t border-white/10">
          <p className="mx-auto max-w-6xl px-4 py-5 text-center font-sans text-xs uppercase tracking-wide text-on-dark-muted">
            © {new Date().getFullYear()} OCNOO Online Store — King Ocnoo Computer
            Ventures. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
