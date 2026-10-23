import type { Metadata } from "next";
import PolicyPage from "@/components/pages/PolicyPage";
import { POLICIES } from "@/content/policies";

export const metadata: Metadata = {
  title: "Copyright Infringement Policy — OCNOO Online Store",
};

export default function CopyrightPolicyPage() {
  // The only policy page not backed by the business's own document — DOCS.pdf
  // contains no copyright policy. It keeps its placeholder copy, and
  // `policy.placeholder` makes the page say so at the foot.
  return <PolicyPage policy={POLICIES.copyright} />;
}
