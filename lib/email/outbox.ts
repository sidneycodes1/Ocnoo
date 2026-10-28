import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/supabase";
import { renderEmail, type EmailTemplate, type OrderEmailPayload } from "@/lib/email/render";

/**
 * Drains `public.email_outbox` through Brevo.
 *
 * The rows are written by the SQL order functions, in the same transaction as
 * the order itself, so "the order exists" already implies "the mail is queued".
 * This half only has to deliver them and record what happened. It is a poller
 * rather than a webhook from the browser for one reason: a customer closing the
 * tab after checkout must not be able to cancel their own receipt.
 */

/** A row that has failed this many times is left as `failed` and revisited by a human. */
const MAX_ATTEMPTS = 5;

/** Brevo's transactional mail endpoint. */
const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

const TEMPLATES: EmailTemplate[] = [
  "order_received",
  "payment_claimed",
  "payment_confirmed",
  "status_changed",
  "new_order_admin",
];

interface OutboxRow {
  id: number;
  template: string;
  to_email: string | null;
  recipient_role: "customer" | "admin";
  payload: OrderEmailPayload | null;
  attempts: number;
}

export interface DrainReport {
  processed: number;
  sent: number;
  failed: number;
  /** Set when the worker could not run at all, so nothing was attempted. */
  skipped?: string;
}

interface BrevoConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  adminEmail: string;
}

function brevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  if (!apiKey || !fromEmail) return null;
  return {
    apiKey,
    fromEmail,
    fromName: process.env.BREVO_FROM_NAME?.trim() || "OCNOO Online Store",
    // Shop-owner mail has no address on the row by design — it is configuration,
    // not customer data, so changing it never needs a migration.
    adminEmail: process.env.BREVO_ADMIN_EMAIL?.trim() || fromEmail,
  };
}

function isTemplate(value: string): value is EmailTemplate {
  return (TEMPLATES as string[]).includes(value);
}

async function postToBrevo(
  config: BrevoConfig,
  input: { to: string; subject: string; html: string; preheader: string },
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: config.fromName, email: config.fromEmail },
        to: [{ email: input.to }],
        subject: input.subject,
        htmlContent: input.html,
        preheader: input.preheader,
      }),
    });
    if (response.ok) return { ok: true };
    const body = await response.text().catch(() => "");
    return { ok: false, message: `Brevo ${response.status}: ${body.slice(0, 300)}` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Brevo request failed" };
  }
}

async function mark(
  client: SupabaseClient,
  row: OutboxRow,
  result: { status: "sent" | "failed" | "pending"; error?: string },
): Promise<void> {
  const { error } = await client
    .from("email_outbox")
    .update({
      status: result.status,
      attempts: row.attempts + 1,
      last_error: result.error ?? null,
      sent_at: result.status === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", row.id);

  if (error) {
    // Nothing sensible to do: the row stays pending and is retried, which is the
    // safe direction for a mail that may already have gone out.
    console.warn(`[email] could not record the result for row ${row.id}: ${error.message}`);
  }
}

export async function drainOutbox(limit = 10): Promise<DrainReport> {
  const config = brevoConfig();
  if (!config) {
    return { processed: 0, sent: 0, failed: 0, skipped: "BREVO_API_KEY or BREVO_FROM_EMAIL is not set" };
  }

  const client = getServiceClient();
  if (!client) {
    return {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: "SUPABASE_SERVICE_ROLE_KEY is not set, so the queue cannot be read",
    };
  }

  const { data, error } = await client
    .from("email_outbox")
    .select("id, template, to_email, recipient_role, payload, attempts")
    .eq("status", "pending")
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    return { processed: 0, sent: 0, failed: 0, skipped: `Could not read the queue: ${error.message}` };
  }

  const rows = (data ?? []) as OutboxRow[];
  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const recipient = row.recipient_role === "admin" ? config.adminEmail : row.to_email;
    if (!recipient || !isTemplate(row.template)) {
      // Not a retryable problem — the address or the template will not appear by
      // waiting — so it is recorded as failed on the first pass.
      await mark(client, row, {
        status: "failed",
        error: !recipient ? "No recipient address for this template" : `Unknown template ${row.template}`,
      });
      failed += 1;
      continue;
    }

    const rendered = renderEmail(row.template, row.payload ?? {});
    const result = await postToBrevo(config, {
      to: recipient,
      subject: rendered.subject,
      html: rendered.html,
      preheader: rendered.preheader,
    });

    if (result.ok) {
      await mark(client, row, { status: "sent" });
      sent += 1;
      continue;
    }

    const attempts = row.attempts + 1;
    await mark(client, row, {
      status: attempts >= MAX_ATTEMPTS ? "failed" : "pending",
      error: result.message,
    });
    failed += 1;
    console.warn(`[email] row ${row.id} (${row.template}) attempt ${attempts} failed: ${result.message}`);
  }

  return { processed: rows.length, sent, failed };
}
