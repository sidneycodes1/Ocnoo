"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: string[];
}

interface ApplicationFormProps {
  fields: FormFieldConfig[];
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
}

export default function ApplicationForm({
  fields,
  submitLabel = "Submit",
  successTitle = "Thanks, we'll be in touch",
  successBody = "This is a demo form — nothing was actually sent anywhere.",
}: ApplicationFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isRequiredFilled = (f: FormFieldConfig) =>
    !f.required || (values[f.name] ?? "").trim() !== "";

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const valid = fields.every(isRequiredFilled);
    setAttempted(true);
    if (valid) setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card className="flex flex-col items-start gap-3 p-6">
        <h3 className="font-sans text-xl font-extrabold uppercase">
          {successTitle}
        </h3>
        <p className="font-sans">{successBody}</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {fields.map((f) => {
        const showRequiredError =
          attempted && f.required && (values[f.name] ?? "").trim() === "";
        return (
          <label key={f.name} className="flex flex-col gap-1">
            <span className="font-sans text-sm font-bold uppercase tracking-wide">
              {f.label}
              {f.required && <span aria-hidden="true"> *</span>}
            </span>

            {f.type === "select" ? (
              <Select
                options={f.options ?? []}
                placeholder="Select…"
                aria-invalid={showRequiredError || undefined}
                value={values[f.name] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: e.target.value }))
                }
              />
            ) : f.type === "textarea" ? (
              <Input
                multiline
                rows={f.rows ?? 4}
                placeholder={f.placeholder}
                aria-invalid={showRequiredError || undefined}
                value={values[f.name] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: e.target.value }))
                }
              />
            ) : (
              <Input
                type={f.type ?? "text"}
                placeholder={f.placeholder}
                aria-invalid={showRequiredError || undefined}
                value={values[f.name] ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, [f.name]: e.target.value }))
                }
              />
            )}

            {showRequiredError && (
              <span role="alert" className="font-sans text-sm font-bold">Required field.</span>
            )}
          </label>
        );
      })}

      <div className="pt-2">
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
