"use client";

import { usePathname } from "next/navigation";
import { bottomBar } from "@/lib/nav";

// Literal class names only: Tailwind cannot see classes built by concatenation.
const CLEARANCE = {
  tabbar: "pb-tabbar",
  actionbar: "pb-actionbar",
  none: "",
} as const;

// In-flow clearance for whichever fixed bar the screen owns its bottom edge
// with. A spacer is used rather than padding on the footer because the bar
// differs per screen — static footer padding would leave a gap where there is
// no bar, or not enough where there is one.
export default function MobileBottomSpacer() {
  const pathname = usePathname();
  const bar = bottomBar(pathname);
  if (bar === "none") return null;

  // Padding (not height) so the safe-area inset adds on top of the bar height
  // instead of being absorbed by box-border.
  return (
    <div className={`${CLEARANCE[bar]} md:hidden`} aria-hidden="true" />
  );
}
