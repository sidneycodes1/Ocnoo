import type { Metadata } from "next";
import InfoPage from "@/components/pages/InfoPage";

export const metadata: Metadata = {
  title: "FAQ — OCNOO Online Store",
};

export default function FaqPage() {
  return (
    <InfoPage
      title="FAQ"
      intro="Answers to a few common questions about shopping with OCNOO. Placeholder copy for the demo."
      sections={[
        {
          heading: "How do I place an order?",
          body: [
            "Add items to your cart, open the cart, then complete the three-step checkout. You will receive an order number on the confirmation screen.",
          ],
        },
        {
          heading: "How can I track my order?",
          body: [
            "Use the Track Order page and enter your order number to see its current status.",
          ],
        },
        {
          heading: "Do you offer wholesale or reselling?",
          body: [
            "Yes. Visit the Wholesale and Become a Reseller pages and submit an enquiry — our team will follow up.",
          ],
        },
        {
          heading: "Is this a real store?",
          body: [
            "This is a design demo. No payment is taken and no goods are actually sold, so you can explore the full flow safely.",
          ],
        },
      ]}
    />
  );
}
