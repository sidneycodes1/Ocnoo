import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Wholesale", href: "/wholesale" },
  { label: "Become a Reseller", href: "/become-a-reseller" },
  { label: "Track Order", href: "/track-order" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white pb-[76px] md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <p className="font-sans text-xl font-extrabold uppercase tracking-tight">
            OCNOO
          </p>
          <p className="mt-1 font-sans text-sm">Buy • Sell • Resell</p>
          <p className="mt-3 font-sans text-sm">
            An e-commerce brand affiliated with King Ocnoo Computer Ventures.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="mb-3 font-sans text-sm font-bold uppercase tracking-wide">
            Shop
          </p>
          <ul className="flex flex-col gap-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-sans text-sm hover:underline hover:underline-offset-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mb-3 font-sans text-sm font-bold uppercase tracking-wide">
            Reach us
          </p>
          <p className="font-sans text-sm">
            Message us on WhatsApp to place or ask about orders.
          </p>
        </div>
      </div>

      <div className="border-t-2 border-black">
        <p className="mx-auto max-w-6xl px-4 py-4 font-sans text-xs uppercase tracking-wide">
          © {new Date().getFullYear()} OCNOO Online Store — King Ocnoo Computer
          Ventures. Demo build, no real transactions.
        </p>
      </div>
    </footer>
  );
}
