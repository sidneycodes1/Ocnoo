import type { Metadata } from "next";
import Link from "next/link";
import {
  BagIcon,
  BoxIcon,
  CartIcon,
  CheckIcon,
  ChevronRightIcon,
  PaymentIcon,
  PinIcon,
  ShareIcon,
} from "@/components/ui/icons";
import { BUSINESS, MAILTO_LINK, TEL_LINK, WHATSAPP_LINK } from "@/lib/business";
import { getPublishedProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "About — OCNOO Online Store",
  description: `${BUSINESS.brandName} is an e-commerce brand of ${BUSINESS.legalName}. Buy for yourself, buy in bulk for a business, or resell to your own network.`,
};

/**
 * The three ways to trade. Each one links somewhere real, because a value
 * card that goes nowhere is decoration - and `/wholesale` and
 * `/become-a-reseller` already exist in this app.
 */
const WAYS = [
  {
    n: "01",
    title: "Buy",
    icon: <BagIcon size={22} />,
    tint: "bg-tint-mint",
    body: "Quality products across electronics, home, fashion and beauty — at honest prices, delivered to you.",
    href: "/shop",
    cta: "Browse the shop",
  },
  {
    n: "02",
    title: "Sell",
    icon: <BoxIcon size={22} />,
    tint: "bg-tint-amber",
    body: "Businesses and organisations buy in bulk at wholesale rates, and the rate improves as the volume grows.",
    href: "/wholesale",
    cta: "See wholesale",
  },
  {
    n: "03",
    title: "Resell",
    icon: <ShareIcon size={22} />,
    tint: "bg-tint-pink",
    body: "Individuals market OCNOO products to their own network and earn an agreed margin on completed sales.",
    href: "/become-a-reseller",
    cta: "Become a reseller",
  },
];

/** The real order path this store implements, end to end. */
const STEPS = [
  {
    icon: <CartIcon size={20} />,
    title: "Build a cart",
    body: "Add what you want, then take three short steps at checkout.",
  },
  {
    icon: <PaymentIcon size={20} />,
    title: "Declare payment",
    body: "Transfer to the account shown, then tell us it is on its way.",
  },
  {
    icon: <CheckIcon size={20} />,
    title: "We verify it",
    body: "The shop confirms the payment against your order number.",
  },
  {
    icon: <PinIcon size={20} />,
    title: "Track to delivery",
    body: "Follow placed → packed → dispatched → delivered, any time.",
  },
];

const POLICY_LINKS = [
  { label: "Terms & Conditions", href: "/about/terms" },
  { label: "Privacy Policy", href: "/about/privacy" },
  { label: "Billing & Payments", href: "/about/billing-policy" },
  { label: "Copyright Policy", href: "/about/copyright-policy" },
];

export default async function AboutPage() {
  // Real counts from the live catalogue rather than invented round numbers.
  const catalogue = await getPublishedProducts();
  const categories = new Set(catalogue.map((p) => p.category)).size;

  const stats = [
    { value: String(catalogue.length), label: "Live listings" },
    { value: String(categories), label: "Categories stocked" },
    { value: "3", label: "Ways to trade" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      {/* ---- Hero -------------------------------------------------------
          The page title lives here as a visible statement instead of the
          `sr-only md:not-sr-only` heading the legal pages use: the mobile
          header already reads "About", so a second "About OCNOO" would be
          said twice, and the promise is the better thing to show. */}
      <section className="overflow-hidden rounded-3xl bg-charcoal px-6 py-10 shadow-soft md:px-12 md:py-16">
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-on-dark-muted">
          {BUSINESS.legalName}
        </p>

        {/* Sized down at phone width on purpose. Measured at 36px the line ran
            to within 3.5px of the panel's `overflow-hidden` clip edge, so a
            machine whose system-ui is a few percent wider would have silently
            cut off "RESELL." The tighter leading only applies where the line
            cannot wrap. */}
        <h1 className="mt-4 font-sans text-[1.75rem] font-extrabold uppercase leading-[1.05] tracking-tight text-on-dark sm:text-4xl md:text-6xl md:leading-[0.95]">
          Buy<span className="text-accent">.</span> Sell
          <span className="text-accent">.</span> Resell
          <span className="text-accent">.</span>
        </h1>

        <p className="mt-5 max-w-[56ch] font-sans text-base leading-relaxed text-on-dark-muted md:text-lg">
          OCNOO is an online store built to make quality products easier to get —
          whether you are shopping for yourself, stocking a business, or earning
          from the people you already know.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-5 py-2 font-sans text-sm font-bold uppercase tracking-wide text-black shadow-soft transition-shadow hover:shadow-soft-hover"
          >
            Shop now
          </Link>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/20 px-5 py-2 font-sans text-sm font-bold uppercase tracking-wide text-on-dark transition-colors hover:border-accent hover:text-accent"
          >
            Talk to us
          </a>
        </div>
      </section>

      {/* ---- Real numbers ---------------------------------------------- */}
      <dl className="mt-6 grid grid-cols-1 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="px-6 py-5 text-center sm:text-left">
            <dt className="order-2 mt-1 block font-sans text-xs uppercase tracking-wide text-black/50">
              {stat.label}
            </dt>
            <dd className="order-1 block font-mono text-3xl font-bold text-accent-ink">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* ---- The three ways -------------------------------------------- */}
      <section className="mt-12 md:mt-16">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-black/50">
          What we do
        </h2>
        <p className="mt-2 font-sans text-2xl font-extrabold tracking-tight md:text-3xl">
          One store, three ways in.
        </p>

        {/* `grid-cols-1` is the base on purpose: without an explicit single
            column the tracks are implicit and a long word can push the whole
            row past the phone viewport. */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {WAYS.map((way) => (
            <Link
              key={way.title}
              href={way.href}
              className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-soft transition-all duration-150 ease-out motion-safe:lg-hover:-translate-y-1 motion-safe:lg-hover:hover:shadow-soft-hover"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full ${way.tint}`}
                aria-hidden="true"
              >
                {way.icon}
              </span>
              <span className="mt-5 font-mono text-xs text-black/40">{way.n}</span>
              <h3 className="mt-1 font-sans text-lg font-extrabold uppercase tracking-tight">
                {way.title}
              </h3>
              <p className="mt-2 flex-1 font-sans text-sm leading-relaxed text-black/70">
                {way.body}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 font-sans text-xs font-bold uppercase tracking-wide text-accent-ink">
                {way.cta}
                <ChevronRightIcon
                  size={14}
                  className="transition-transform duration-150 ease-out motion-safe:lg-hover:group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- How an order actually goes -------------------------------- */}
      <section className="mt-12 md:mt-16">
        <h2 className="font-sans text-xs font-bold uppercase tracking-[0.22em] text-black/50">
          How it works
        </h2>
        <p className="mt-2 font-sans text-2xl font-extrabold tracking-tight md:text-3xl">
          From cart to doorstep, four steps.
        </p>

        <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-line bg-white p-5"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface"
                  aria-hidden="true"
                >
                  {step.icon}
                </span>
                {/* The connector only makes sense when the steps sit side by
                    side, so it is hidden in the stacked layouts. */}
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-px flex-1 bg-line lg:block"
                  />
                )}
              </div>
              <h3 className="mt-4 font-sans text-sm font-extrabold uppercase tracking-wide">
                {step.title}
              </h3>
              <p className="mt-1.5 font-sans text-sm leading-relaxed text-black/70">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---- Contact + policies ---------------------------------------- */}
      <section className="mt-12 rounded-2xl border border-line bg-white p-6 md:mt-16 md:p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-sans text-lg font-extrabold uppercase tracking-tight">
              Talk to a human
            </h2>
            <p className="mt-2 font-sans text-sm leading-relaxed text-black/70">
              Every channel below reaches {BUSINESS.legalName} directly — no
              ticket queue, no bot.
            </p>
            <ul className="mt-5 flex flex-col gap-2 font-sans text-sm">
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-accent-ink underline decoration-line underline-offset-4 hover:decoration-accent-ink"
                >
                  WhatsApp {BUSINESS.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={TEL_LINK}
                  className="text-black underline decoration-line underline-offset-4 hover:decoration-black/50"
                >
                  Call {BUSINESS.phoneDisplay}
                </a>
              </li>
              <li>
                <a
                  href={MAILTO_LINK}
                  className="break-all text-black underline decoration-line underline-offset-4 hover:decoration-black/50"
                >
                  {BUSINESS.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="md:border-l md:border-line md:pl-8">
            <h2 className="font-sans text-lg font-extrabold uppercase tracking-tight">
              The small print
            </h2>
            <p className="mt-2 font-sans text-sm leading-relaxed text-black/70">
              What you agree to, what we do with your details, and how billing
              and delivery are handled.
            </p>
            <ul className="mt-5 flex flex-col gap-0.5">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-[44px] items-center justify-between gap-3 font-sans text-sm text-black transition-colors hover:text-accent-ink"
                  >
                    {link.label}
                    <ChevronRightIcon size={14} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
