import type { Metadata } from "next";
import InfoPage from "@/components/pages/InfoPage";

export const metadata: Metadata = {
  title: "Terms & Conditions — OCNOO Online Store",
};

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms & Conditions"
      updated="September 2026"
      intro="These placeholder terms describe the general rules for using the OCNOO Online Store demo. By browsing or placing an order you agree to the terms below."
      sections={[
        {
          heading: "1. Using the store",
          body: [
            "You agree to use OCNOO only for lawful purposes and not to interfere with the site or attempt to access it using a method other than the interface we provide.",
          ],
        },
        {
          heading: "2. Products & pricing",
          body: [
            "All product listings, prices and availability are subject to change without notice. While we take care to display information accurately, we do not warrant that descriptions or pricing are error-free.",
          ],
        },
        {
          heading: "3. Orders",
          body: [
            "Placing an order is a request to purchase. We may confirm, adjust or decline an order at our discretion. A contract is formed only when we confirm dispatch.",
          ],
        },
        {
          heading: "4. Accounts",
          body: [
            "You are responsible for keeping any account details you create on this site secure and for all activity that happens under them.",
          ],
        },
      ]}
    />
  );
}
