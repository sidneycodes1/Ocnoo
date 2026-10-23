import type { Metadata } from "next";
import PolicyPage from "@/components/pages/PolicyPage";
import { POLICIES } from "@/content/policies";

export const metadata: Metadata = {
  title: "Safety Tips — OCNOO Online Store",
};

export default function SafetyTipsPage() {
  return <PolicyPage policy={POLICIES.safety} />;
}
