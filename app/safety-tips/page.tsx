import type { Metadata } from "next";
import InfoPage from "@/components/pages/InfoPage";

export const metadata: Metadata = {
  title: "Safety Tips — OCNOO Online Store",
};

export default function SafetyTipsPage() {
  return (
    <InfoPage
      title="Safety Tips"
      intro="A few simple habits that help you shop safely online. This is placeholder guidance for the demo."
      sections={[
        {
          heading: "Shop from the official store",
          body: [
            "Always confirm you are on the genuine OCNOO site before entering any details, and be wary of look-alike links shared over messaging apps.",
          ],
        },
        {
          heading: "Protect your account",
          body: [
            "Use a strong, unique password and never share one-time codes or payment details with anyone, including people claiming to be support staff.",
          ],
        },
        {
          heading: "Inspect on delivery",
          body: [
            "Check your order before the delivery agent leaves where possible, and report damaged or incorrect items promptly with photos.",
          ],
        },
        {
          heading: "Keep records",
          body: [
            "Save your order number and receipts. If something goes wrong, contact support through the Contact page rather than unofficial channels.",
          ],
        },
      ]}
    />
  );
}
