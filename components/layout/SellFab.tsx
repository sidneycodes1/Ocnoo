"use client";

import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";

// Routes where a global "list an item" CTA is noise: the composer itself (it is
// the same action, already on screen), the list of what you posted, and the
// purchase funnel (don't distract mid-purchase).
const HIDDEN_ON = ["/my-ads", "/become-a-reseller", "/cart", "/checkout"];

function PlusIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

// Persistent floating sell CTA — desktop only. On mobile the raised centre
// "Sell" tab in <TabBar /> is the equivalent affordance, and having both would
// stack two floating actions over the product action bar.
export default function SellFab() {
  const pathname = usePathname();
  // `/sell/<id>` is the same composer, so the prefix check has to cover it; an
  // exact match on "/sell" would leave the FAB floating over an open form.
  const onComposer = pathname === "/sell" || pathname.startsWith("/sell/");
  if (onComposer || HIDDEN_ON.includes(pathname)) return null;

  return (
    // The aside is the fixed element so the button keeps its own inline-flex
    // sizing, and it is a landmark: this link used to sit outside every
    // landmark on the page, which axe reports as a `region` violation on the
    // six routes where the FAB renders.
    <aside
      aria-label="Sell on OCNOO"
      className="fixed bottom-6 right-6 z-40 hidden md:block"
    >
      <Button
        href="/sell"
        variant="highlight"
        shape="pill"
        aria-label="List Your Item"
        className="gap-2"
      >
        <PlusIcon />
        <span>List Your Item</span>
      </Button>
    </aside>
  );
}
