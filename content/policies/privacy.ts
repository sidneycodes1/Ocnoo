import { BUSINESS, MAILTO_LINK, TEL_LINK } from "@/lib/business";
import type { Policy } from "./types";

// Transcribed from the business's "PRIVACY POLICY" (DOCS.pdf, effective
// 11 October 2026). Section 18's `[Insert …]` placeholders are filled from
// lib/business.ts; a designated privacy contact and the business address have no
// known value, so those lines are absent.

export const privacyPolicy: Policy = {
  title: "Privacy Policy",
  effective: "11 October 2026",
  standfirst: `An online retail brand of ${BUSINESS.legalName}`,
  sections: [
    {
      id: "introduction",
      heading: "1. Introduction",
      blocks: [
        {
          kind: "para",
          text: "Welcome to OCNOO Online Store, an online retail brand affiliated with King Ocnoo Computer Ventures.",
        },
        {
          kind: "para",
          text: "We respect your privacy and are committed to protecting the personal information you share with us when visiting our online store, making purchases, requesting quotations, contacting our customer service team, or using our services.",
        },
        {
          kind: "para",
          text: "This Privacy Policy explains what information we collect, how we use it, when we may share it, and the measures we take to protect it.",
        },
        {
          kind: "para",
          text: "By using our services, you acknowledge that you have read this Privacy Policy. Where consent is legally required, we will seek it separately.",
        },
      ],
    },
    {
      id: "information-we-collect",
      heading: "2. Personal Information We Collect",
      blocks: [
        {
          kind: "para",
          text: "Depending on how you interact with our business, we may collect the following information:",
        },
        { kind: "sub", text: "A. Personal and contact information" },
        {
          kind: "list",
          items: [
            "Full name.",
            "Telephone number.",
            "Email address.",
            "Delivery address and relevant location details.",
          ],
        },
        { kind: "sub", text: "B. Order and transaction information" },
        {
          kind: "list",
          items: [
            "Products purchased or requested.",
            "Order numbers and invoices.",
            "Payment confirmation and transaction references.",
            "Delivery instructions and order history.",
            "Refund, return, warranty, and customer service records.",
          ],
        },
        { kind: "sub", text: "C. Business and corporate information" },
        {
          kind: "para",
          text: "For wholesale, reseller, and corporate customers, we may collect relevant business names, business contact details, purchase orders, billing information, and authorised representative details.",
        },
        { kind: "sub", text: "D. Technical information" },
        {
          kind: "para",
          text: "If you use our website, we may collect limited technical information, such as device type, browser information, website usage data, and cookies, depending on the features and technologies used.",
        },
        {
          kind: "para",
          text: "We do not intentionally collect information that is unnecessary for our business purposes.",
        },
      ],
    },
    {
      id: "how-we-collect-information",
      heading: "3. How We Collect Information",
      blocks: [
        { kind: "para", text: "We may collect information when you:" },
        {
          kind: "list",
          items: [
            "Place an order or request a quotation.",
            "Complete a customer registration or contact form.",
            "Contact us by telephone, email, messaging applications, or social media.",
            "Make a payment or request a refund.",
            "Subscribe to promotional updates.",
            "Browse our website, where applicable technical tools are used.",
          ],
        },
        {
          kind: "para",
          text: "We may also receive necessary transaction or delivery information from payment providers, delivery companies, and authorised business partners.",
        },
      ],
    },
    {
      id: "how-we-use-your-information",
      heading: "4. How We Use Your Information",
      blocks: [
        {
          kind: "para",
          text: "We use personal information for legitimate business purposes, including:",
        },
        {
          kind: "list",
          items: [
            "Processing and confirming customer orders.",
            "Verifying payments and issuing invoices or receipts.",
            "Arranging deliveries and providing order updates.",
            "Responding to enquiries, complaints, returns, and warranty requests.",
            "Managing wholesale, reseller, and corporate relationships.",
            "Preventing fraud and protecting the security of transactions.",
            "Maintaining accounting, tax, and other legally required business records.",
            "Improving our products, services, and customer experience.",
            "Sending promotional messages where permitted by law and, where required, with your consent.",
            "Complying with applicable legal and regulatory obligations.",
          ],
        },
        {
          kind: "para",
          text: "We will not use personal information for unrelated purposes without an appropriate lawful basis.",
        },
      ],
    },
    {
      id: "legal-basis-for-processing",
      heading: "5. Legal Basis for Processing",
      blocks: [
        {
          kind: "para",
          text: "We process personal information in accordance with applicable Nigerian data protection requirements.",
        },
        {
          kind: "para",
          text: "Depending on the circumstances, our lawful basis may include:",
        },
        {
          kind: "list",
          items: [
            "Your consent.",
            "Taking steps necessary to fulfil an order or contract.",
            "Compliance with a legal obligation.",
            "Legitimate business interests, where permitted by law and where those interests do not override your applicable rights.",
            "Other lawful grounds recognised under applicable data protection legislation.",
          ],
        },
        {
          kind: "para",
          text: "Where processing relies on consent, you may withdraw that consent, subject to legal limitations and any consequences explained to you.",
        },
      ],
    },
    {
      id: "payment-information-and-security",
      heading: "6. Payment Information and Security",
      blocks: [
        {
          kind: "para",
          text: "We take reasonable steps to protect payment-related information.",
        },
        {
          kind: "para",
          text: "Payments may be handled through banks, payment gateways, or other authorised payment service providers. Their own privacy and security policies may also apply.",
        },
        {
          kind: "para",
          text: "We may retain payment confirmations, transaction references, invoices, and relevant accounting records where necessary.",
        },
        {
          kind: "para",
          text: "We will never ask you to disclose your bank PIN, online banking password, or one-time password (OTP) through our customer service channels to confirm an order or process a refund.",
        },
        {
          kind: "para",
          text: "Customers should ensure that payments are made only through verified payment channels.",
        },
      ],
    },
    {
      id: "sharing-of-personal-information",
      heading: "7. Sharing of Personal Information",
      blocks: [
        {
          kind: "para",
          text: "We do not sell customers' personal information to third parties.",
        },
        {
          kind: "para",
          text: "We may share limited information when reasonably necessary with:",
        },
        {
          kind: "list",
          items: [
            "Delivery and logistics providers to fulfil orders.",
            "Banks and payment service providers to process transactions.",
            "Technology and website service providers that support our operations.",
            "Professional advisers and auditors where necessary.",
            "Government agencies, regulators, courts, or law enforcement authorities where legally required.",
            "Other authorised parties where you have consented or another lawful basis applies.",
          ],
        },
        {
          kind: "para",
          text: "Where appropriate, we take reasonable steps to ensure that service providers protect personal information and use it only for authorised purposes.",
        },
      ],
    },
    {
      id: "data-storage-and-retention",
      heading: "8. Data Storage and Retention",
      blocks: [
        {
          kind: "para",
          text: "We retain personal information only for as long as reasonably necessary for the purposes described in this policy, including fulfilling orders, resolving disputes, maintaining business records, and complying with legal obligations.",
        },
        {
          kind: "para",
          text: "Retention periods may vary depending on the type of information and applicable legal requirements.",
        },
        {
          kind: "para",
          text: "When personal information is no longer required, we will take reasonable steps to delete it, anonymise it, or securely dispose of it, subject to any legal obligations to retain it.",
        },
      ],
    },
    {
      id: "data-security",
      heading: "9. Data Security",
      blocks: [
        {
          kind: "para",
          text: "We implement reasonable organisational and technical measures to help protect personal information against unauthorised access, disclosure, alteration, loss, or misuse.",
        },
        {
          kind: "para",
          text: "These measures may include restricting access to customer records, using appropriate account security, maintaining secure business records, and working with reputable service providers.",
        },
        {
          kind: "para",
          text: "However, no method of electronic transmission or storage can be guaranteed to be completely secure. Customers should also protect their devices, passwords, and account information.",
        },
      ],
    },
    {
      id: "cookies-and-website-technologies",
      heading: "10. Cookies and Website Technologies",
      blocks: [
        {
          kind: "para",
          text: "If our website uses cookies or similar technologies, they may be used to:",
        },
        {
          kind: "list",
          items: [
            "Support essential website functions.",
            "Remember relevant preferences.",
            "Understand website usage.",
            "Improve performance and customer experience.",
            "Support advertising or analytics where implemented and legally permitted.",
          ],
        },
        {
          kind: "para",
          text: "Where required, we will provide appropriate information and obtain consent before using non-essential cookies or similar technologies.",
        },
        {
          kind: "para",
          text: "You may be able to manage cookies through your browser settings, although disabling certain cookies may affect website functionality.",
        },
      ],
    },
    {
      id: "marketing-communications",
      heading: "11. Marketing and Promotional Communications",
      blocks: [
        {
          kind: "para",
          text: "We may communicate information about products, special offers, new arrivals, and other business updates where permitted by law.",
        },
        {
          kind: "para",
          text: "You can request to stop receiving promotional communications by using the available unsubscribe option or contacting us directly.",
        },
        {
          kind: "para",
          text: "Opting out of marketing will not prevent us from sending essential communications relating to your orders, payments, deliveries, refunds, or other necessary customer service matters.",
        },
      ],
    },
    {
      id: "your-privacy-rights",
      heading: "12. Your Privacy Rights",
      blocks: [
        { kind: "para", text: "Subject to applicable law, you may have the right to:" },
        {
          kind: "list",
          items: [
            "Request access to your personal information.",
            "Request correction of inaccurate or incomplete information.",
            "Request deletion of personal information where legally applicable.",
            "Object to or request restriction of certain processing activities.",
            "Withdraw consent where processing is based on consent.",
            "Request information about how your data is used or shared.",
            "Lodge a complaint with the appropriate data protection authority.",
          ],
        },
        {
          kind: "para",
          text: "To exercise an applicable right, please contact us using the details provided below. We may need to verify your identity before responding.",
        },
        {
          kind: "para",
          text: "Some requests may be limited where we are legally required to retain particular records or where another lawful exception applies.",
        },
      ],
    },
    {
      id: "childrens-privacy",
      heading: "13. Children's Privacy",
      blocks: [
        {
          kind: "para",
          text: "Our online store is intended for general retail customers and businesses. We do not knowingly collect children's personal information in circumstances where doing so would violate applicable law.",
        },
        {
          kind: "para",
          text: "Where consent or additional safeguards are legally required for a child's personal information, we will follow the applicable requirements.",
        },
        {
          kind: "para",
          text: "If you believe a child has provided personal information inappropriately, please contact us so that we can review the matter.",
        },
      ],
    },
    {
      id: "third-party-websites",
      heading: "14. Third-Party Websites and Services",
      blocks: [
        {
          kind: "para",
          text: "Our website or social media pages may contain links to third-party websites, payment services, delivery services, or other platforms.",
        },
        {
          kind: "para",
          text: "We do not control the privacy practices of independent third parties. Customers should review their privacy policies before providing information directly to them.",
        },
      ],
    },
    {
      id: "international-transfers",
      heading: "15. International Transfers of Information",
      blocks: [
        {
          kind: "para",
          text: "Where our service providers or technology systems process personal information outside Nigeria, we will take appropriate steps to ensure that any international transfer complies with applicable Nigerian data protection requirements.",
        },
      ],
    },
    {
      id: "personal-data-breaches",
      heading: "16. Personal Data Breaches",
      blocks: [
        {
          kind: "para",
          text: "If we become aware of a personal data breach affecting information under our responsibility, we will assess the incident and take appropriate steps to contain, investigate, and address it.",
        },
        {
          kind: "para",
          text: "Where notification is required by applicable law, we will notify the relevant authority and affected individuals in accordance with the applicable legal requirements and timelines.",
        },
      ],
    },
    {
      id: "changes-to-this-policy",
      heading: "17. Changes to This Privacy Policy",
      blocks: [
        {
          kind: "para",
          text: "We may update this Privacy Policy to reflect changes in our business operations, technology, services, or legal obligations.",
        },
        {
          kind: "para",
          text: "The revised policy will be published through our official channels, with the effective date updated accordingly.",
        },
        {
          kind: "para",
          text: "We encourage customers to review this page periodically.",
        },
      ],
    },
    {
      id: "contact-us",
      heading: "18. Contact Us",
      blocks: [
        {
          kind: "para",
          text: "For privacy questions, requests to access or correct personal information, or concerns about how your data is handled, please contact:",
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
        {
          kind: "para",
          text: "We will review privacy enquiries and respond within the period required by applicable law.",
        },
      ],
    },
  ],
  outro: {
    heading: "Our privacy commitment",
    blocks: [
      {
        kind: "para",
        text: "OCNOO Online Store is committed to handling customer information responsibly, maintaining appropriate safeguards, and communicating transparently about our privacy practices.",
      },
      {
        kind: "para",
        text: "Your trust matters to us. Your information deserves protection.",
      },
    ],
  },
};
