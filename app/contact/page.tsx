import type { Metadata } from "next";
import ApplicationForm from "@/components/forms/ApplicationForm";
import Card from "@/components/ui/Card";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

export const metadata: Metadata = {
  title: "Contact — OCNOO Online Store",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-sans text-3xl font-extrabold uppercase tracking-tight md:text-4xl">
        Contact Us
      </h1>

      <p className="mt-4 font-sans leading-relaxed">
        Have a question about a product, an order or delivery? Send us a message
        and our team will get back to you.
      </p>

      <div className="mt-6">
        <WhatsAppButton label="Chat on WhatsApp" />
      </div>

      <Card className="mt-8 p-6 md:p-8">
        <h2 className="mb-4 font-sans text-xl font-extrabold uppercase">
          Send a Message
        </h2>
        <ApplicationForm
          submitLabel="Send Message"
          successTitle="Thanks, we'll be in touch"
          successBody="Your message has been noted. This is a demo — nothing was actually sent."
          fields={[
            { name: "name", label: "Name", required: true, placeholder: "Your name" },
            { name: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
            { name: "message", label: "Message", type: "textarea", rows: 5, required: true, placeholder: "How can we help?" },
          ]}
        />
      </Card>
    </div>
  );
}
