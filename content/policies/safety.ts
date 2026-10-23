import { BUSINESS } from "@/lib/business";
import type { Policy } from "./types";

// Transcribed from the business's "SAFETY TIPS FOR CUSTOMERS" (DOCS.pdf). The
// document carries no effective date, so none is claimed here — unlike the other
// three, which all state 11 October 2026.

export const safetyPolicy: Policy = {
  title: "Safety Tips for Customers",
  standfirst: `An online retail brand of ${BUSINESS.legalName}`,
  sections: [
    {
      id: "make-payments-safely",
      heading: "1. Make Payments Safely",
      blocks: [
        {
          kind: "list",
          items: [
            "Make payments only to the official business account provided through our authorised communication channels.",
            "Always confirm the account name and payment details before transferring money.",
            "Never send money to an unknown personal account claiming to represent our business.",
            "Keep your payment receipts and transaction references for future enquiries.",
          ],
        },
      ],
    },
    {
      id: "beware-of-fraudsters",
      heading: "2. Beware of Fraudsters",
      blocks: [
        {
          kind: "list",
          items: [
            "Purchase products only through our official website, verified social media pages, or authorised representatives.",
            "Be cautious of suspicious messages, fake promotions, and offers that appear too good to be true.",
            "Do not trust anyone who requests extra payments through an unauthorised account.",
            "Contact our official customer service channel if you suspect fraudulent activity.",
          ],
        },
      ],
    },
    {
      id: "protect-your-personal-information",
      heading: "3. Protect Your Personal Information",
      blocks: [
        {
          kind: "list",
          items: [
            "Share only the information necessary to complete your order.",
            "Never disclose your bank PIN, password, one-time password (OTP), or card security code to anyone claiming to be our staff.",
            "Avoid clicking suspicious links sent by unknown persons.",
            "Use secure internet connections when making online payments.",
          ],
        },
      ],
    },
    {
      id: "confirm-your-order-details",
      heading: "4. Confirm Your Order Details",
      blocks: [
        { kind: "para", text: "Before making payment, confirm:" },
        {
          kind: "list",
          items: [
            "Product name, specifications, and quantity.",
            "Total price and delivery charges.",
            "Delivery address and telephone number.",
            "Estimated delivery date.",
            "Applicable warranty, return, and refund conditions.",
          ],
        },
      ],
    },
    {
      id: "inspect-your-delivery",
      heading: "5. Inspect Your Delivery",
      blocks: [
        {
          kind: "list",
          items: [
            "Check the package for visible damage or signs of tampering.",
            "Confirm that the product and accessories match your order.",
            "Report missing items, incorrect products, or visible damage promptly through our official customer service channel.",
            "Keep your invoice, receipt, and warranty documents.",
          ],
        },
      ],
    },
    {
      id: "use-electronic-products-safely",
      heading: "6. Use Electronic Products Safely",
      blocks: [
        {
          kind: "para",
          text: "For computers, tablets, phones, chargers, power banks, and other electronic products:",
        },
        {
          kind: "list",
          items: [
            "Follow the manufacturer's instructions.",
            "Use compatible chargers and accessories.",
            "Avoid using damaged charging cables or batteries.",
            "Keep electronic devices away from water and excessive heat.",
            "Purchase and use products in accordance with their safety instructions.",
          ],
        },
      ],
    },
    {
      id: "protect-your-account",
      heading: "7. Protect Your Account",
      blocks: [
        {
          kind: "list",
          items: [
            "Use strong, unique passwords for shopping accounts.",
            "Enable two-factor authentication where available.",
            "Log out of shared devices after shopping.",
            "Never share your account login details with strangers.",
          ],
        },
      ],
    },
    {
      id: "report-suspicious-activity",
      heading: "8. Report Suspicious Activity",
      blocks: [
        {
          kind: "para",
          text: "If you encounter a suspected scam, unauthorised payment request, fake account, or suspicious transaction involving our store, stop the transaction and contact us through our official contact details.",
        },
      ],
    },
  ],
  outro: {
    heading: "Our commitment to you",
    blocks: [
      {
        kind: "para",
        text: "OCNOO Online Store is committed to promoting safer online shopping through clear communication, responsible handling of customer information, and transparent purchasing procedures.",
      },
      {
        kind: "para",
        text: "Shop smart. Pay safely. Stay protected.",
      },
      {
        kind: "para",
        text: `${BUSINESS.legalName} — your trusted partner for online shopping.`,
      },
    ],
  },
};
