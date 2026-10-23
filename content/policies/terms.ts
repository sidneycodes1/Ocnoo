import { BUSINESS, MAILTO_LINK, TEL_LINK } from "@/lib/business";
import type { Policy } from "./types";

// Transcribed from the business's own "TERMS AND CONDITIONS" document
// (DOCS.pdf, effective 11 October 2026). Wording is kept as supplied; the only
// substitutions are the document's own `[Insert …]` placeholders, filled from
// lib/business.ts. Two placeholders have no known value — the business address
// and a dedicated privacy contact — so those lines are simply absent.

export const termsPolicy: Policy = {
  title: "Terms & Conditions",
  effective: "11 October 2026",
  standfirst: `An online retail brand of ${BUSINESS.legalName}`,
  sections: [
    {
      id: "introduction",
      heading: "1. Introduction",
      blocks: [
        {
          kind: "para",
          text: `Welcome to ${BUSINESS.brandName}, an online retail brand affiliated with ${BUSINESS.legalName}. These Terms and Conditions govern your access to and use of our online store, products, services, and purchasing facilities.`,
        },
        {
          kind: "para",
          text: "By accessing our store, placing an order, or purchasing any product from us, you agree to these Terms and Conditions. Please read them carefully before making a purchase.",
        },
      ],
    },
    {
      id: "products-and-services",
      heading: "2. Our Products and Services",
      blocks: [
        {
          kind: "para",
          text: `${BUSINESS.brandName} offers products for retail customers, wholesalers, resellers, businesses, and other interested buyers.`,
        },
        {
          kind: "para",
          text: "Our product categories may include:",
        },
        {
          kind: "list",
          items: [
            "Computers, laptops, tablets, and mobile devices.",
            "Computer accessories and electronic gadgets.",
            "Phone accessories and power banks.",
            "Office equipment and supplies.",
            "Household products and other merchandise offered by the store.",
          ],
        },
        {
          kind: "para",
          text: "We aim to provide accurate product descriptions, images, specifications, and prices. However, minor variations in colour, packaging, appearance, or product presentation may occur.",
        },
      ],
    },
    {
      id: "product-availability",
      heading: "3. Product Availability",
      blocks: [
        {
          kind: "para",
          text: "All products are subject to availability. Displaying a product on our website, social media page, catalogue, or other sales channel does not guarantee that it is currently in stock.",
        },
        {
          kind: "para",
          text: "If an ordered product becomes unavailable after payment, we will inform the customer and discuss an appropriate alternative, refund, or other mutually agreed resolution.",
        },
      ],
    },
    {
      id: "prices-and-payments",
      heading: "4. Prices and Payments",
      blocks: [
        {
          kind: "para",
          text: "All product prices will be communicated through our official sales channels. Unless otherwise stated, prices are quoted in Nigerian naira (₦).",
        },
        {
          kind: "para",
          text: "Customers are responsible for confirming the final order price, delivery fees, applicable charges, and payment instructions before completing a purchase.",
        },
        { kind: "para", text: "Accepted payment methods may include:" },
        {
          kind: "list",
          items: [
            "Bank transfers to an officially designated business account.",
            "Approved online payment channels.",
            "Other payment methods expressly accepted by OCNOO Online Store.",
          ],
        },
        {
          kind: "para",
          text: "Customers should retain proof of payment and provide it when requested. An order will be processed after payment has been confirmed, unless a written credit or alternative payment arrangement has been approved.",
        },
        {
          kind: "para",
          text: "Customers should not transfer money to personal or unauthorised accounts claiming to represent our business.",
        },
      ],
    },
    {
      id: "order-confirmation-and-cancellation",
      heading: "5. Order Confirmation and Cancellation",
      blocks: [
        {
          kind: "para",
          text: "An order is considered accepted when OCNOO Online Store confirms it through an official communication channel.",
        },
        {
          kind: "para",
          text: "Customers should verify the product description, quantity, price, delivery address, and contact details before confirming an order.",
        },
        {
          kind: "para",
          text: "Requests to cancel or amend an order should be made as soon as possible. Cancellation may not be possible after an order has been dispatched, customised, or otherwise committed to fulfilment.",
        },
        {
          kind: "para",
          text: "Where cancellation is accepted, any applicable refund will be handled in accordance with our Refund and Returns Policy and applicable law.",
        },
      ],
    },
    {
      id: "delivery-and-shipping",
      heading: "6. Delivery and Shipping",
      blocks: [
        {
          kind: "para",
          text: "We offer delivery arrangements based on the customer's location, the type of product, availability, and the agreed delivery method.",
        },
        {
          kind: "list",
          items: [
            "Delivery charges and estimated delivery periods will be communicated before order confirmation.",
            "Delivery timelines are estimates and may be affected by circumstances beyond our reasonable control.",
            "Customers must provide accurate delivery addresses and reachable telephone numbers.",
            "Customers should inspect delivered goods promptly and report visible damage, shortages, or incorrect items as soon as reasonably possible.",
            "Any additional delivery costs resulting from an incorrect address or a customer-requested change may be charged to the customer where disclosed and agreed.",
          ],
        },
        {
          kind: "para",
          text: "Risk of loss and responsibility for delivered goods will be handled in accordance with applicable law and the agreed delivery terms.",
        },
      ],
    },
    {
      id: "returns-exchanges-and-refunds",
      heading: "7. Returns, Exchanges, and Refunds",
      blocks: [
        {
          kind: "para",
          text: "We aim to ensure that customers receive the products they ordered in the agreed condition.",
        },
        {
          kind: "para",
          text: "A customer may contact us regarding a return, exchange, repair, or refund where a product is:",
        },
        {
          kind: "list",
          items: [
            "Defective or damaged on arrival.",
            "Incorrectly supplied.",
            "Materially different from its agreed description.",
            "Otherwise eligible for a remedy under applicable law.",
          ],
        },
        {
          kind: "para",
          text: "Customers should contact our customer service team promptly and provide the order details and, where appropriate, supporting photographs or videos.",
        },
        {
          kind: "para",
          text: "Products should be returned with their accessories, packaging, receipts, and warranty documents where reasonably available. These requirements will not override any rights customers have under applicable law.",
        },
        {
          kind: "para",
          text: "Change-of-mind returns, opened products, customised goods, and products showing signs of misuse may be subject to separate conditions, provided those conditions are disclosed and lawful.",
        },
        {
          kind: "para",
          text: "Approved refunds will be processed through an agreed payment method within a reasonable period, subject to applicable payment-provider procedures and legal requirements.",
        },
      ],
    },
    {
      id: "warranty-and-after-sales",
      heading: "8. Product Warranty and After-Sales Support",
      blocks: [
        {
          kind: "para",
          text: "Products may carry a manufacturer's warranty, supplier warranty, or store warranty, depending on the item purchased.",
        },
        {
          kind: "para",
          text: "The applicable warranty period, coverage, exclusions, and claims procedure will be communicated where available.",
        },
        {
          kind: "para",
          text: "Customers should retain proof of purchase for warranty claims. Damage resulting from misuse, unauthorised repairs, accidents, improper installation, or failure to follow product instructions may not be covered by a warranty, subject to the applicable warranty terms and law.",
        },
        {
          kind: "para",
          text: "Nothing in these Terms and Conditions removes any statutory consumer rights.",
        },
      ],
    },
    {
      id: "wholesale-and-reseller",
      heading: "9. Wholesale and Reseller Purchases",
      blocks: [
        {
          kind: "para",
          text: `${BUSINESS.brandName} may offer wholesale pricing or special arrangements to resellers, corporate buyers, and bulk purchasers.`,
        },
        { kind: "para", text: "Such arrangements may be subject to:" },
        {
          kind: "list",
          items: [
            "Minimum order quantities.",
            "Separate quotations and negotiated prices.",
            "Agreed payment deadlines.",
            "Stock availability.",
            "Written delivery and credit terms.",
          ],
        },
        {
          kind: "para",
          text: "Wholesale and reseller terms will apply only when expressly agreed by both parties.",
        },
      ],
    },
    {
      id: "credit-sales",
      heading: "10. Credit Sales and Outstanding Balances",
      blocks: [
        {
          kind: "para",
          text: `Credit sales are not automatic and require prior approval by ${BUSINESS.legalName} or its authorised representative.`,
        },
        { kind: "para", text: "Where credit is approved:" },
        {
          kind: "list",
          items: [
            "The invoice must state the amount payable and due date.",
            "Customers must settle outstanding balances according to the agreed payment schedule.",
            "Any applicable late-payment charges must be disclosed and lawfully agreed in advance.",
            "Disputed invoices should be raised promptly so that the parties can seek a resolution.",
          ],
        },
        {
          kind: "para",
          text: "The business reserves the right to suspend further credit sales where an account is overdue, subject to the agreed terms and applicable law.",
        },
      ],
    },
    {
      id: "customer-responsibilities",
      heading: "11. Customer Responsibilities",
      blocks: [
        { kind: "para", text: "Customers agree to:" },
        {
          kind: "list",
          items: [
            "Provide accurate contact, billing, and delivery information.",
            "Make payments through authorised channels.",
            "Use purchased products in accordance with applicable laws and product instructions.",
            "Avoid fraudulent orders, payment disputes based on false claims, or misuse of our sales channels.",
            "Treat our employees, representatives, and other customers respectfully.",
          ],
        },
      ],
    },
    {
      id: "privacy-and-personal-information",
      heading: "12. Privacy and Personal Information",
      blocks: [
        {
          kind: "para",
          text: "We may collect information such as names, telephone numbers, delivery addresses, order details, and payment confirmation records to process orders, arrange deliveries, provide customer support, and maintain appropriate business records.",
        },
        {
          kind: "para",
          text: "We will handle personal information in accordance with applicable Nigerian data protection requirements. Customer information will only be shared where reasonably necessary for business operations, delivery, payment processing, legal compliance, or another lawful purpose.",
        },
        {
          kind: "para",
          text: "Customers may contact us to make enquiries about their personal information or applicable privacy rights.",
        },
      ],
    },
    {
      id: "intellectual-property",
      heading: "13. Intellectual Property",
      blocks: [
        {
          kind: "para",
          text: `The ${BUSINESS.brandName} name, logo, original promotional materials, website content, and other business materials may be protected by applicable intellectual property laws.`,
        },
        {
          kind: "para",
          text: "Customers and third parties may not reproduce or use our original branding or materials for commercial purposes without permission, except where permitted by law.",
        },
        {
          kind: "para",
          text: "Product names, trademarks, and logos belonging to manufacturers or other third parties remain the property of their respective owners.",
        },
      ],
    },
    {
      id: "limitation-of-liability",
      heading: "14. Limitation of Liability",
      blocks: [
        {
          kind: "para",
          text: `${BUSINESS.brandName} will make reasonable efforts to provide reliable products and services. To the extent permitted by law, we are not responsible for indirect losses arising from circumstances outside our reasonable control.`,
        },
        {
          kind: "para",
          text: "Nothing in these Terms and Conditions excludes or limits liability where such exclusion or limitation is prohibited by law, including applicable consumer protection rights.",
        },
      ],
    },
    {
      id: "changes-to-these-terms",
      heading: "15. Changes to These Terms",
      blocks: [
        {
          kind: "para",
          text: "We may update these Terms and Conditions when our business practices, products, services, or legal requirements change.",
        },
        {
          kind: "para",
          text: "The latest version will be made available through our official sales channels, with the effective date updated accordingly. Changes will not unlawfully remove rights already acquired by customers.",
        },
      ],
    },
    {
      id: "complaints-and-dispute-resolution",
      heading: "16. Complaints and Dispute Resolution",
      blocks: [
        {
          kind: "para",
          text: "Customers are encouraged to contact us first to resolve complaints through good-faith communication.",
        },
        {
          kind: "para",
          text: "Where a dispute cannot be resolved informally, the parties may pursue the appropriate remedies available under Nigerian law, including recourse to the relevant consumer protection or dispute-resolution authorities.",
        },
      ],
    },
    {
      id: "governing-law",
      heading: "17. Governing Law",
      blocks: [
        {
          kind: "para",
          text: "These Terms and Conditions are governed by the applicable laws of the Federal Republic of Nigeria.",
        },
      ],
    },
    {
      id: "contact-information",
      heading: "18. Contact Information",
      blocks: [
        {
          kind: "para",
          text: "For enquiries, orders, complaints, returns, and other customer support matters, please contact:",
        },
        {
          kind: "fields",
          items: [
            { label: "Business name", value: BUSINESS.legalName },
            { label: "Online retail brand", value: BUSINESS.brandName },
            {
              label: "Telephone",
              value: BUSINESS.phoneDisplay,
              href: TEL_LINK,
            },
            { label: "Email", value: BUSINESS.email, href: MAILTO_LINK },
            { label: "Facebook", value: "facebook.com", href: BUSINESS.facebook },
            {
              label: "Instagram",
              value: "@king_ocnoo_computer_ventures",
              href: BUSINESS.instagram,
            },
          ],
        },
      ],
    },
  ],
  outro: {
    heading: "Customer acknowledgement",
    blocks: [
      {
        kind: "para",
        text: "By placing an order with OCNOO Online Store, the customer acknowledges that they have had the opportunity to read and understand these Terms and Conditions and agrees to the applicable terms of purchase.",
      },
    ],
  },
};
