import type { Metadata } from "next";
import ApplicationForm from "@/components/forms/ApplicationForm";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Become a Reseller — OCNOO Online Store",
};

const CATEGORY_OPTIONS = [
  "Computers & Phones",
  "Electronics & Power Accessories",
  "Home & Kitchen",
  "Office & School Supplies",
  "Fashion & Accessories",
  "Beauty & Personal Care",
  "Household Products",
];

export default function BecomeAResellerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-sans text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
        Become an OCNOO Reseller
      </h1>

      <div className="mt-4 flex flex-col gap-4 font-sans leading-relaxed">
        <p>
          Individuals can market OCNOO products to their own network and earn an
          agreed margin on every completed sale. You bring the customers — we
          handle the products and fulfilment.
        </p>
        <p>
          It is a simple way to start earning with a real catalogue of quality
          products behind you. Apply below and our team will share the reseller
          terms and margins.
        </p>
      </div>

      <Card className="mt-8 p-6 md:p-8">
        <h2 className="mb-4 font-sans text-xl font-extrabold uppercase">
          Reseller Application
        </h2>
        <ApplicationForm
          submitLabel="Apply to Resell"
          successTitle="Thanks, we'll be in touch"
          successBody="Your reseller application has been noted. This is a demo — no information was actually sent."
          fields={[
            { name: "name", label: "Full Name", required: true, placeholder: "Your name" },
            { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "08000000000" },
            { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
            { name: "channels", label: "Where will you sell?", type: "textarea", rows: 3, placeholder: "e.g. WhatsApp status, Instagram, campus, market" },
            { name: "interest", label: "Product Categories of Interest", type: "select", required: true, options: CATEGORY_OPTIONS },
          ]}
        />
      </Card>
    </div>
  );
}
