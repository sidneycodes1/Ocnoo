import type { Metadata } from "next";
import PolicyPage from "@/components/pages/PolicyPage";
import { POLICIES } from "@/content/policies";

export const metadata: Metadata = {
  title: "Billing Policy — OCNOO Online Store",
};

export default function BillingPolicyPage() {
  return <PolicyPage policy={POLICIES.billing} />;
}
