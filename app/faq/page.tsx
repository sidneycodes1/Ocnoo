import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDownIcon } from "@/components/ui/icons";
import { BUSINESS, WHATSAPP_LINK } from "@/lib/business";

export const metadata: Metadata = {
  title: "FAQ — OCNOO Online Store",
  description:
    "How ordering, payment, delivery, tracking, cancellation, wholesale and reselling work at OCNOO.",
};

/**
 * Every answer here describes something this store actually does — the payment
 * declaration path, the tracking ladder, the cancellation guard — or restates
 * the billing/terms policy. No delivery fee is quoted: `lib/delivery.ts`
 * carries placeholder rates that the business has not confirmed, so the answer
 * points at checkout, where the fee is disclosed before payment.
 */
const QUESTIONS: { q: string; a: string }[] = [
  {
    q: "How do I place an order?",
    a: "Add what you want to the cart, open the cart, and complete the three-step checkout — details, address, payment. You get an order number on the confirmation screen, and the same screen tells you where to send the transfer.",
  },
  {
    q: "How do I pay, and when is my order confirmed?",
    a: "Payment is by bank transfer to the account shown at checkout. Once you have sent it, press “I have made payment” on your order — that tells the shop to look for it. The order then reads Declared until the team confirms it as Paid. A declaration is a heads-up, not a receipt: nothing is confirmed until the money is verified.",
  },
  {
    q: "How do I track my order?",
    a: "Use the Track Order page with your order number. You will see it move through placed, packed, dispatched and delivered, with the time each step was stamped, plus the payment status alongside it.",
  },
  {
    q: "How much is delivery?",
    a: "Delivery depends on where you are, and on the size and weight of the order. The exact fee for your basket is shown at checkout before you confirm anything — it is added to the total, never collected afterwards.",
  },
  {
    q: "Can I cancel or return an item?",
    a: "You can cancel from your order page while the order has not been dispatched. Once it is on its way, cancellation is no longer possible, so tell us as early as you can. For a damaged, incorrect or faulty item, contact us and the returns process in the Terms applies.",
  },
  {
    q: "Do you sell wholesale, or can I resell?",
    a: "Both. Businesses and organisations can buy in bulk at wholesale rates through the Wholesale page. Individuals can market OCNOO products to their own network and earn an agreed margin — start from the Become a Reseller page and send in an enquiry.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
      <p className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-black/45">
        Help
      </p>
      <h1 className="mt-3 font-sans text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
        Questions, answered.
      </h1>
      <p className="mt-3 font-sans text-base leading-relaxed text-black/70">
        The short version of how ordering, payment and delivery work. If your
        question is not here, the same people answer the phone who pack the
        boxes.
      </p>

      {/* Native <details>/<summary> rather than a scripted accordion: keyboard
          operation, focus handling and the disclosure semantics are built in,
          the answers stay in the HTML for search, and nothing breaks if the
          JavaScript never lands. `name="faq"` makes the group exclusive in
          browsers that support it, and degrades to independent panels in ones
          that do not - which is still usable, just not one-open-at-a-time.
          The first panel is open so the widget reads as an accordion at a
          glance instead of a list of dead rows. */}
      <div className="mt-8 flex flex-col gap-3">
        {QUESTIONS.map((item, i) => (
          <details
            key={item.q}
            name="faq"
            open={i === 0}
            className="group rounded-2xl border border-line bg-white shadow-soft transition-shadow hover:shadow-soft-hover"
          >
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-sans text-base font-bold marker:hidden [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              {item.q}
              <ChevronDownIcon
                size={18}
                className="shrink-0 transition-transform duration-200 ease-out group-open:rotate-180"
              />
            </summary>
            <p className="border-t border-line px-5 pb-5 pt-4 font-sans text-sm leading-relaxed text-black/75">
              {item.a}
            </p>
          </details>
        ))}
      </div>

      {/* ---- Still stuck ------------------------------------------------ */}
      <section className="mt-10 overflow-hidden rounded-2xl bg-charcoal px-6 py-8">
        <h2 className="font-sans text-lg font-extrabold uppercase tracking-tight text-on-dark">
          Still stuck?
        </h2>
        <p className="mt-2 max-w-[46ch] font-sans text-sm leading-relaxed text-on-dark-muted">
          Send the order number and one line about the problem. Questions about
          an existing order are answered fastest on WhatsApp.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-5 py-2 font-sans text-sm font-bold uppercase tracking-wide text-black"
          >
            WhatsApp us
          </a>
          <Link
            href="/contact"
            className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/20 px-5 py-2 font-sans text-sm font-bold uppercase tracking-wide text-on-dark transition-colors hover:border-accent hover:text-accent"
          >
            Contact form
          </Link>
        </div>
        <p className="mt-5 font-sans text-xs text-on-dark-muted">
          {BUSINESS.legalName} · {BUSINESS.phoneDisplay} ·{" "}
          <a
            href={`mailto:${BUSINESS.email}`}
            className="underline decoration-white/40 underline-offset-2 hover:text-on-dark"
          >
            {BUSINESS.email}
          </a>
        </p>
      </section>
    </div>
  );
}
