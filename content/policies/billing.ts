import { BUSINESS, MAILTO_LINK, TEL_LINK } from "@/lib/business";
import type { Policy } from "./types";

// Transcribed from the business's "BILLING, PAYMENT, INVOICING AND REFUND
// POLICY" (DOCS.pdf, effective 11 October 2026). Section 16's `[Insert …]`
// placeholders are filled from lib/business.ts; the business address has no
// known value, so that line is absent. The document's blank
// "Authorised signature / Date" rules are a printed sign-off and are not
// published on a web page.

export const billingPolicy: Policy = {
  title: "Billing, Payment, Invoicing & Refund Policy",
  effective: "11 October 2026",
  standfirst: `An online retail brand of ${BUSINESS.legalName}`,
  sections: [
    {
      id: "introduction",
      heading: "1. Introduction",
      blocks: [
        {
          kind: "para",
          text: `King Ocnoo Computer Ventures, operating its customer-facing online retail platform as OCNOO Online Store, is committed to providing transparent, secure, and reliable billing services to all customers, wholesalers, retailers, and business partners.`,
        },
        {
          kind: "para",
          text: "This policy explains our payment procedures, invoicing practices, refunds, cancellations, outstanding balances, and other billing-related matters.",
        },
        {
          kind: "para",
          text: "By placing an order with OCNOO Online Store, customers agree to the applicable terms and conditions outlined in this policy.",
        },
      ],
    },
    {
      id: "product-pricing-and-charges",
      heading: "2. Product Pricing and Charges",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "All product prices shall be communicated clearly before an order is confirmed.",
            "Prices may change due to supplier costs, market conditions, exchange rates, promotions, or product availability.",
            "Applicable delivery fees, service charges, installation fees, or other additional costs will be communicated to customers before payment.",
            "Where applicable, taxes and statutory charges will be disclosed in accordance with Nigerian law.",
            "The price confirmed at the time of order acceptance will apply to that order unless the customer agrees to a subsequent change.",
          ],
        },
      ],
    },
    {
      id: "accepted-payment-methods",
      heading: "3. Accepted Payment Methods",
      blocks: [
        {
          kind: "para",
          text: "OCNOO Online Store may accept the following payment methods, subject to availability:",
        },
        {
          kind: "list",
          items: [
            "Bank transfer to an officially designated business account.",
            "Debit card or other supported electronic payment channels.",
            "Approved payment gateways.",
            "Cash payments where expressly permitted by the business.",
            "Credit or instalment arrangements where approved in writing by management.",
          ],
        },
        {
          kind: "para",
          text: "Customers should verify payment details through official business communication channels before making payments. Customers must not transfer money to an employee's or third party's personal account unless specifically authorised through a verifiable official arrangement.",
        },
      ],
    },
    {
      id: "payment-confirmation-and-processing",
      heading: "4. Payment Confirmation and Order Processing",
      blocks: [
        {
          kind: "list",
          ordered: true,
          items: [
            "Orders will normally be processed after payment has been confirmed.",
            "Customers must provide accurate payment references or transaction evidence when requested.",
            "A payment receipt or acknowledgement will be issued after successful verification.",
            "Order processing and delivery timelines will be communicated to customers.",
            "A transfer screenshot alone does not constitute final payment confirmation until the funds have been verified.",
            "OCNOO Online Store reserves the right to delay processing where payment is incomplete, unverified, reversed, or suspected to be fraudulent.",
          ],
        },
      ],
    },
    {
      id: "invoicing-and-receipts",
      heading: "5. Invoicing and Receipts",
      blocks: [
        {
          kind: "para",
          text: "OCNOO Online Store may issue quotations, pro forma invoices, commercial invoices, payment receipts, and account statements, as appropriate.",
        },
        {
          kind: "para",
          text: "Invoices should include the following information where applicable:",
        },
        {
          kind: "list",
          items: [
            "Business name and contact details.",
            "Invoice number and issue date.",
            "Customer name and billing details.",
            "Product description, quantity, unit price, and total amount.",
            "Delivery fees, applicable taxes, and other authorised charges.",
            "Total amount payable.",
            "Amount paid and outstanding balance.",
            "Payment deadline and approved payment instructions.",
          ],
        },
        {
          kind: "para",
          text: "Customers should review their invoices promptly and report any errors or discrepancies before the order is fulfilled, where practicable.",
        },
        {
          kind: "para",
          text: "Receipts will be issued for payments received and verified.",
        },
      ],
    },
    {
      id: "deposits-and-part-payments",
      heading: "6. Deposits and Part Payments",
      blocks: [
        {
          kind: "para",
          text: "Where a deposit or part payment is required, the amount, purpose, payment schedule, and remaining balance will be communicated to the customer before the transaction is confirmed.",
        },
        {
          kind: "para",
          text: "For special orders, bulk purchases, customised products, or products sourced specifically for a customer, the business may require an advance deposit.",
        },
        {
          kind: "para",
          text: "The treatment of deposits in cases of cancellation, non-delivery, or supplier failure will be determined by the agreed transaction terms and applicable law. Deposits will not automatically be treated as non-refundable in every circumstance.",
        },
      ],
    },
    {
      id: "outstanding-balances-and-credit",
      heading: "7. Outstanding Balances and Credit Sales",
      blocks: [
        {
          kind: "para",
          text: "Unless a written credit arrangement has been approved, customers are expected to pay the full amount due before dispatch or delivery.",
        },
        { kind: "para", text: "For approved credit customers:" },
        {
          kind: "list",
          ordered: true,
          items: [
            "The agreed credit limit and payment period must be documented.",
            "The invoice must state the due date and outstanding balance.",
            "Customers are responsible for settling invoices within the agreed period.",
            "The business may issue payment reminders for overdue accounts.",
            "Further credit sales may be suspended where previous invoices remain overdue.",
            "Any agreed payment extension must be approved by management in writing.",
          ],
        },
        {
          kind: "para",
          text: "Late-payment charges, where lawful and contractually agreed in advance, will be disclosed to the customer. The business will not impose undisclosed charges after an order has been accepted.",
        },
      ],
    },
    {
      id: "order-cancellation",
      heading: "8. Order Cancellation",
      blocks: [
        {
          kind: "para",
          text: "Customers who wish to cancel an order should contact OCNOO Online Store as soon as possible and provide the relevant order or invoice number.",
        },
        { kind: "para", text: "Cancellation requests will be assessed according to the order status:" },
        {
          kind: "list",
          items: [
            "Before processing: Cancellation may be accepted where the order has not been committed to procurement or fulfilment.",
            "After procurement or preparation: Reasonable, documented costs may be considered where permitted by law and the agreed terms.",
            "After dispatch or delivery: The applicable return, refund, and delivery terms will apply.",
          ],
        },
        {
          kind: "para",
          text: "Where the business cancels an order because it cannot supply the agreed product, the customer will be informed and any refund due will be processed in accordance with this policy and applicable law.",
        },
      ],
    },
    {
      id: "refund-policy",
      heading: "9. Refund Policy",
      blocks: [
        { kind: "para", text: "Refund requests may be considered in circumstances including:" },
        {
          kind: "list",
          items: [
            "Payment made for an order that the business cannot fulfil.",
            "Duplicate payments or verified overpayments.",
            "Products supplied incorrectly or damaged on arrival, subject to verification.",
            "Products that fail to conform to the agreed description or applicable consumer protection requirements.",
            "Other circumstances in which a refund is required by law or agreed by the business.",
          ],
        },
        {
          kind: "para",
          text: "Customers should submit refund requests with the order number, proof of payment, a description of the issue, and supporting evidence where appropriate.",
        },
        {
          kind: "para",
          text: "Approved refunds will ordinarily be returned through the original payment method where practicable. If that is not possible, an alternative verified method may be agreed with the customer.",
        },
        {
          kind: "para",
          text: "The processing period will be communicated after the request has been reviewed and approved. Bank or payment-provider processing times may vary.",
        },
        {
          kind: "para",
          text: "Refunds will not be unreasonably withheld where a customer is legally entitled to one.",
        },
      ],
    },
    {
      id: "returns-and-exchanges",
      heading: "10. Returns and Exchanges",
      blocks: [
        {
          kind: "para",
          text: "Customers should report incorrect, damaged, defective, or non-conforming products promptly after delivery.",
        },
        {
          kind: "para",
          text: "Returned items may be inspected to establish the nature of the complaint. Where appropriate, the business may offer a replacement, repair, exchange, refund, or another lawful remedy.",
        },
        {
          kind: "para",
          text: "Products must be returned with relevant accessories, packaging, and proof of purchase where reasonably available. However, the absence of original packaging will not automatically remove a customer's statutory rights.",
        },
        {
          kind: "para",
          text: "Any exclusions, hygiene-related restrictions, warranty conditions, or special-order limitations must be communicated clearly before purchase and must comply with applicable law.",
        },
      ],
    },
    {
      id: "overpayments-and-duplicate-payments",
      heading: "11. Overpayments and Duplicate Payments",
      blocks: [
        {
          kind: "para",
          text: "Where a customer pays more than the invoiced amount or makes a duplicate payment, the customer should notify the business and provide transaction references.",
        },
        {
          kind: "para",
          text: "After verification, the excess amount may be refunded or credited to the customer's account, as agreed.",
        },
        {
          kind: "para",
          text: "No refund will be made to an unverified third-party account without appropriate checks.",
        },
      ],
    },
    {
      id: "fraud-prevention-and-disputes",
      heading: "12. Fraud Prevention and Payment Disputes",
      blocks: [
        {
          kind: "para",
          text: "OCNOO Online Store reserves the right to investigate suspicious transactions, inconsistent payment information, suspected fraud, or unauthorised payment claims.",
        },
        {
          kind: "para",
          text: "Customers should contact the business promptly if they believe a payment has been made in error or an unauthorised transaction has occurred.",
        },
        {
          kind: "para",
          text: "The business will review genuine disputes fairly and may request relevant supporting documents. Personal and payment information will be handled responsibly and in accordance with applicable privacy and data-protection requirements.",
        },
      ],
    },
    {
      id: "billing-errors-and-complaints",
      heading: "13. Billing Errors and Complaints",
      blocks: [
        {
          kind: "para",
          text: "Customers who identify an incorrect invoice, unexplained charge, missing payment acknowledgement, or disputed balance should contact customer service using the official business contact details.",
        },
        {
          kind: "para",
          text: "The complaint should include the customer's name, invoice or order number, transaction reference, and a clear description of the issue.",
        },
        {
          kind: "para",
          text: "The business will review the matter and communicate its findings and any corrective action.",
        },
      ],
    },
    {
      id: "wholesale-and-reseller-billing",
      heading: "14. Wholesale and Reseller Billing",
      blocks: [
        {
          kind: "para",
          text: "Wholesale and reseller customers may be subject to separate pricing schedules, minimum order quantities, deposits, payment deadlines, and credit limits.",
        },
        {
          kind: "para",
          text: `Any special arrangement must be confirmed in writing by an authorised representative of ${BUSINESS.legalName}.`,
        },
        {
          kind: "para",
          text: "Wholesale discounts and promotional prices will apply only under the stated conditions and for the specified period.",
        },
      ],
    },
    {
      id: "policy-amendments",
      heading: "15. Policy Amendments",
      blocks: [
        {
          kind: "para",
          text: `${BUSINESS.legalName} reserves the right to update this policy to reflect changes in business operations, payment systems, or applicable laws.`,
        },
        {
          kind: "para",
          text: "The current version will be made available through the OCNOO Online Store website or another official business channel. Changes will not override rights or obligations already established under an existing transaction, except as permitted by law.",
        },
      ],
    },
    {
      id: "contact-and-billing-support",
      heading: "16. Contact and Billing Support",
      blocks: [
        {
          kind: "para",
          text: "For billing enquiries, payment confirmation, invoice corrections, refund requests, or outstanding balance disputes, customers should contact:",
        },
        {
          kind: "fields",
          items: [
            { label: "Business name", value: BUSINESS.legalName },
            { label: "Online store", value: BUSINESS.brandName },
            {
              label: "Telephone",
              value: BUSINESS.phoneDisplay,
              href: TEL_LINK,
            },
            { label: "Email", value: BUSINESS.email, href: MAILTO_LINK },
            {
              label: "Bank account for transfers",
              value: `${BUSINESS.bank.bankName} · ${BUSINESS.bank.accountNumber} · ${BUSINESS.bank.accountName}`,
            },
          ],
        },
      ],
    },
    {
      id: "customer-acknowledgement",
      heading: "17. Customer Acknowledgement",
      blocks: [
        {
          kind: "para",
          text: "By completing a purchase, customers acknowledge that they have been provided with access to the applicable billing, payment, cancellation, and refund terms.",
        },
        {
          kind: "para",
          text: "Nothing in this policy is intended to exclude or restrict any consumer rights that cannot lawfully be excluded under applicable Nigerian law.",
        },
      ],
    },
  ],
  outro: {
    heading: "Approval",
    blocks: [
      {
        kind: "para",
        text: `Approved by: Management, ${BUSINESS.legalName}.`,
      },
    ],
  },
};
