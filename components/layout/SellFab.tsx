"use client";

import { usePathname } from "next/navigation";
import Button from "@/components/ui/Button";

// Routes where a global "list an item" CTA is noise: the destination page
// itself, and the checkout funnel (don't distract mid-purchase).
const HIDDEN_ON = ["/become-a-reseller", "/checkout"];

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

// Persistent floating sell CTA. On small screens it sits above the product
// sticky action bar (bottom-24 clears it); from md up it tucks into the corner.
export default function SellFab() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <Button
      href="/become-a-reseller"
      variant="highlight"
      aria-label="List Your Item"
      // !rounded-full: the important modifier is needed to beat the primitive's
      // base `rounded-md` (same specificity, later in the generated stylesheet).
      className="fixed bottom-24 right-4 z-40 gap-2 !rounded-full md:bottom-6 md:right-6"
    >
      <PlusIcon />
      <span>List Your Item</span>
    </Button>
  );
}
