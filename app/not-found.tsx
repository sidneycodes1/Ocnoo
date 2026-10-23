import Link from "next/link";
import Button from "@/components/ui/Button";

// Route-level 404. Without this file Next renders its own unbranded page,
// which the notFound() calls in /product/[slug] and /shop/[category] hit.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md animate-fade-in flex-col items-center gap-4 px-4 py-20 text-center">
      <p className="font-mono text-5xl font-bold">404</p>
      <h1 className="font-sans text-2xl font-extrabold uppercase tracking-tight">
        Page not found
      </h1>
      <p className="font-sans text-base leading-relaxed text-black/70">
        That product or category is no longer here. It may have sold out or been
        renamed.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button href="/shop" variant="primary">
          Browse the shop
        </Button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center font-sans text-sm font-bold uppercase tracking-wide underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
