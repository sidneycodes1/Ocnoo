import type { Metadata } from "next";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About — OCNOO Online Store",
};

const VALUES = [
  {
    title: "Buy",
    body: "Quality products across electronics, home, fashion, beauty and more — at great prices, delivered to you.",
  },
  {
    title: "Sell",
    body: "Businesses and organizations can buy in bulk at wholesale rates as their volume grows.",
  },
  {
    title: "Resell",
    body: "Individuals can market OCNOO products to their network and earn an agreed margin on completed sales.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-sans text-3xl font-extrabold uppercase tracking-tight md:text-4xl sr-only md:not-sr-only">
        About OCNOO
      </h1>

      <div className="mt-4 flex flex-col gap-4 font-sans text-base leading-relaxed">
        <p>
          OCNOO Online Store is an e-commerce brand affiliated with King Ocnoo
          Computer Ventures, created to make quality products more accessible
          through convenient online shopping.
        </p>
        <p>
          Under the simple promise of{" "}
          <span className="font-bold uppercase">Buy • Sell • Resell</span>, OCNOO
          brings everyday products within reach — whether you are shopping for
          yourself, stocking a business, or building a reselling side income.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {VALUES.map((v) => (
          <Card key={v.title} className="flex flex-col gap-2 p-5">
            <h2 className="font-sans text-lg font-extrabold uppercase">
              {v.title}
            </h2>
            <p className="font-sans text-sm">{v.body}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/shop" variant="primary">
          Shop Now
        </Button>
        <Link
          href="/become-a-reseller"
          className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide underline underline-offset-4"
        >
          Become a Reseller
        </Link>
      </div>
    </div>
  );
}
