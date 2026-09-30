import type { Metadata } from "next";
import InfoPage from "@/components/pages/InfoPage";

export const metadata: Metadata = {
  title: "Copyright Infringement Policy — OCNOO Online Store",
};

export default function CopyrightPolicyPage() {
  return (
    <InfoPage
      title="Copyright Infringement Policy"
      updated="September 2026"
      intro="This placeholder policy explains how intellectual-property complaints are generally handled on the OCNOO store."
      sections={[
        {
          heading: "Respect for rights holders",
          body: [
            "OCNOO respects the intellectual-property rights of others and expects the same from its users and sellers. Product listings should only use images and descriptions the seller has the right to publish.",
          ],
        },
        {
          heading: "Reporting infringement",
          body: [
            "If you believe content on this store infringes your copyright, send us the identifying details of the work, its location on the site, and your contact information so we can verify the claim.",
          ],
        },
        {
          heading: "Our response",
          body: [
            "Valid complaints are reviewed promptly. Where infringement is apparent we may remove the offending listing and, for repeat offenders, suspend access to the platform.",
          ],
        },
        {
          heading: "Counter-notice",
          body: [
            "If you believe a listing was removed in error, you may submit a counter-notice with the same level of detail and we will reassess.",
          ],
        },
      ]}
    />
  );
}
