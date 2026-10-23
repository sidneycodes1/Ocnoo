import { BUSINESS } from "@/lib/business";
import { billingPolicy } from "./billing";
import { privacyPolicy } from "./privacy";
import { safetyPolicy } from "./safety";
import { termsPolicy } from "./terms";
import type { Policy } from "./types";

export type { Policy, PolicyBlock, PolicySection } from "./types";

export { billingPolicy, privacyPolicy, safetyPolicy, termsPolicy };

// DOCS.pdf contains no copyright document. This page keeps the invented copy it
// has always had and says so at the foot of the page; it is the only policy page
// not backed by the business's own text.
const copyrightPolicy: Policy = {
  title: "Copyright Infringement Policy",
  standfirst: `An online retail brand of ${BUSINESS.legalName}`,
  placeholder: true,
  sections: [
    {
      id: "respect-for-rights-holders",
      heading: "Respect for rights holders",
      blocks: [
        {
          kind: "para",
          text: "OCNOO respects the intellectual-property rights of others and expects the same from its users and sellers. Product listings should only use images and descriptions the seller has the right to publish.",
        },
      ],
    },
    {
      id: "reporting-infringement",
      heading: "Reporting infringement",
      blocks: [
        {
          kind: "para",
          text: "If you believe content on this store infringes your copyright, send us the identifying details of the work, its location on the site, and your contact information so we can verify the claim.",
        },
      ],
    },
    {
      id: "our-response",
      heading: "Our response",
      blocks: [
        {
          kind: "para",
          text: "Valid complaints are reviewed promptly. Where infringement is apparent we may remove the offending listing and, for repeat offenders, suspend access to the platform.",
        },
      ],
    },
    {
      id: "counter-notice",
      heading: "Counter-notice",
      blocks: [
        {
          kind: "para",
          text: "If you believe a listing was removed in error, you may submit a counter-notice with the same level of detail and we will reassess.",
        },
      ],
    },
  ],
};

export const POLICIES = {
  terms: termsPolicy,
  privacy: privacyPolicy,
  billing: billingPolicy,
  safety: safetyPolicy,
  copyright: copyrightPolicy,
} as const;

export type PolicyKey = keyof typeof POLICIES;
