import type { Metadata } from "next";
import ApplicationForm from "@/components/forms/ApplicationForm";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Wholesale — OCNOO Online Store",
};

const INTEREST_OPTIONS = [
  "Computers & Phones",
  "Electronics & Power Accessories",
  "Home & Kitchen",
  "Office & School Supplies",
  "Fashion & Accessories",
  "Beauty & Personal Care",
  "Household Products",
  "Multiple / Not sure yet",
];

export default function WholesalePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-sans text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
        Wholesale With OCNOO
      </h1>

      <div className="mt-4 flex flex-col gap-4 font-sans leading-relaxed">
        <p>
          As volume increases, OCNOO can supply products in larger quantities to
          businesses, organizations and smaller retailers. Buying wholesale lets
          you stock up at better rates and serve your own customers or team more
          affordably.
        </p>
        <p>
          Tell us a little about your business and what you would like to buy in
          bulk, and our team will reach out with pricing and availability.
        </p>
      </div>

      <Card className="mt-8 p-6 md:p-8">
        <h2 className="mb-4 font-sans text-xl font-extrabold uppercase">
          Wholesale Application
        </h2>
        <ApplicationForm
          submitLabel="Submit Application"
          successTitle="Thanks, we'll be in touch"
          successBody="Your wholesale enquiry has been noted. This is a demo — no information was actually sent."
          fields={[
            { name: "business", label: "Business Name", required: true, placeholder: "Your company or shop name" },
            { name: "contact", label: "Contact Person", required: true, placeholder: "Full name" },
            { name: "phone", label: "Phone", type: "tel", required: true, placeholder: "08000000000" },
            { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
            { name: "interest", label: "Product Interest", type: "select", required: true, options: INTEREST_OPTIONS },
          ]}
        />
      </Card>
    </div>
  );
}
