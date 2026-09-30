import type { Metadata } from "next";
import InfoPage from "@/components/pages/InfoPage";

export const metadata: Metadata = {
  title: "Billing Policy — OCNOO Online Store",
};

export default function BillingPolicyPage() {
  return (
    <InfoPage
      title="Billing Policy"
      updated="September 2026"
      intro="This placeholder billing policy describes how charges, refunds and payment issues are generally handled. No real payment is processed in this demo."
      sections={[
        {
          heading: "Pricing",
          body: [
            "All prices are shown in Nigerian Naira (₦) and include applicable taxes unless stated otherwise at checkout. Delivery fees, where applicable, are shown before you confirm.",
          ],
        },
        {
          heading: "Payments",
          body: [
            "We accept the payment methods offered at checkout. A payment is only captured once your order is confirmed.",
          ],
        },
        {
          heading: "Refunds",
          body: [
            "If an eligible order is cancelled before dispatch, or a product arrives damaged or incorrect, we will refund the purchase price to the original payment method within a reasonable period.",
          ],
        },
        {
          heading: "Disputes",
          body: [
            "If you see a charge you do not recognise, contact our support team with your order number and we will investigate.",
          ],
        },
      ]}
    />
  );
}
