import type { Metadata } from "next";
import InfoPage from "@/components/pages/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy — OCNOO Online Store",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      updated="September 2026"
      intro="This placeholder policy explains, in general terms, what information a store like OCNOO might collect and how it is used. This demo does not run a real backend or store personal data."
      sections={[
        {
          heading: "What we collect",
          body: [
            "Typically an online store collects the details you provide at checkout — name, contact information and delivery address — plus basic usage data such as pages viewed.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "Information is used to process orders, provide customer support, and improve the shopping experience. We do not sell your personal data.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "Cookies help the site remember your cart and preferences. You can clear or block cookies in your browser settings, though some features may stop working.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "You may request access to or deletion of your data. In this demo, any cart data lives only in your own browser and is never sent to a server.",
          ],
        },
      ]}
    />
  );
}
