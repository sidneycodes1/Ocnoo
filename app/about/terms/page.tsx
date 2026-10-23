import type { Metadata } from "next";
import PolicyPage from "@/components/pages/PolicyPage";
import { POLICIES } from "@/content/policies";

export const metadata: Metadata = {
  title: "Terms & Conditions — OCNOO Online Store",
};

export default function TermsPage() {
  return <PolicyPage policy={POLICIES.terms} />;
}
