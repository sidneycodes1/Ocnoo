import { BUSINESS } from "@/lib/business";
import { SITE_URL } from "@/lib/site";
import { formatNaira } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/orderStatus";

/**
 * The five transactional mails the shop sends. They live in code rather than in
 * a dashboard template editor for one reason: everything they say about money
 * and stock is already computed in SQL and handed over in the outbox payload,
 * and a copy the developer cannot read is a copy that quietly starts lying.
 *
 * These render on the server, inside the outbox worker. Nothing here is ever
 * shipped to the browser.
 */

export type EmailTemplate =
  | "order_received"
  | "payment_claimed"
  | "payment_confirmed"
  | "status_changed"
  | "new_order_admin";

/** The shape `place_order` and friends build with `jsonb_build_object`. */
export interface OrderEmailPayload {
  order_number?: string;
  customer_name?: string;
  phone?: string;
  total?: number;
  status?: string;
  payment_method?: string;
  payment_status?: string;
  track_token?: string;
  items?: { name?: string; quantity?: number; line_total?: number }[];
}

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
}

/**
 * Customer names and product titles are free text and both end up in these
 * mails. Without this, a product called `<img onerror=…>` would run in the
 * recipient's mail client, and the shop would be the one that sent it.
 */
function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function naira(amount: unknown): string {
  const value = Number(amount);
  return Number.isFinite(value) ? esc(formatNaira(value)) : "—";
}

function trackingUrl(payload: OrderEmailPayload): string {
  const number = payload.order_number ?? "";
  const token = payload.track_token ?? "";
  if (!number || !token) return SITE_URL;
  return `${SITE_URL}/track-order/${encodeURIComponent(number)}?t=${encodeURIComponent(token)}`;
}

function firstName(full: unknown): string {
  const trimmed = String(full ?? "").trim();
  return trimmed.split(/\s+/)[0] || "there";
}

/**
 * Table layout with inline styles. Mail clients strip `<style>` blocks and
 * fight modern CSS, so the boring markup is the portable one.
 */
function layout(input: {
  title: string;
  intro: string;
  body?: string;
  facts?: { label: string; value: string }[];
  cta?: { label: string; href: string };
  note?: string;
}): string {
  const facts = (input.facts ?? [])
    .map(
      (fact) =>
        `<tr><td style="padding:6px 0;font:14px/1.5 Arial,Helvetica,sans-serif;color:#6b6f6d;">${esc(
          fact.label,
        )}</td><td align="right" style="padding:6px 0;font:700 14px/1.5 Arial,Helvetica,sans-serif;color:#111312;">${
          fact.value
        }</td></tr>`,
    )
    .join("");

  const cta = input.cta
    ? `<tr><td align="center" style="padding:22px 0 6px;">
        <a href="${esc(input.cta.href)}" style="display:inline-block;background:#111312;color:#ffffff;text-decoration:none;font:700 14px/1 Arial,Helvetica,sans-serif;padding:14px 26px;border-radius:10px;">${esc(
          input.cta.label,
        )}</a>
      </td></tr>`
    : "";

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(input.title)}</title></head>
<body style="margin:0;padding:0;background:#f2f4f3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f3;">
    <tr><td align="center" style="padding:26px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e7e5;border-radius:14px;">
        <tr><td style="padding:22px 24px 0;">
          <p style="margin:0;font:800 13px/1 Arial,Helvetica,sans-serif;letter-spacing:2px;color:#111312;">OCNOO</p>
          <p style="margin:6px 0 0;font:12px/1.4 Arial,Helvetica,sans-serif;color:#6b6f6d;">${esc(
            BUSINESS.legalName,
          )}</p>
        </td></tr>
        <tr><td style="padding:20px 24px 0;">
          <h1 style="margin:0;font:800 21px/1.3 Arial,Helvetica,sans-serif;color:#111312;">${esc(
            input.title,
          )}</h1>
          <p style="margin:10px 0 0;font:15px/1.6 Arial,Helvetica,sans-serif;color:#3c403d;">${input.intro}</p>
        </td></tr>
        ${
          facts
            ? `<tr><td style="padding:18px 24px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e7e5;border-bottom:1px solid #e4e7e5;">${facts}</table></td></tr>`
            : ""
        }
        ${input.body ? `<tr><td style="padding:18px 24px 0;">${input.body}</td></tr>` : ""}
        ${cta}
        ${
          input.note
            ? `<tr><td style="padding:18px 24px 22px;"><p style="margin:0;font:12px/1.6 Arial,Helvetica,sans-serif;color:#8b8f8d;">${input.note}</p></td></tr>`
            : `<tr><td style="padding:18px 24px 22px;"></td></tr>`
        }
      </table>
      <p style="margin:16px 0 0;font:11px/1.6 Arial,Helvetica,sans-serif;color:#8b8f8d;">
        ${esc(BUSINESS.brandName)} · <a href="tel:+${esc(BUSINESS.phoneDial)}" style="color:#8b8f8d;">${esc(
          BUSINESS.phoneDisplay,
        )}</a> · <a href="${esc(SITE_URL)}" style="color:#8b8f8d;">${esc(
          SITE_URL.replace(/^https?:\/\//, ""),
        )}</a>
      </p>
    </td></tr>
  </table>
</body></html>`;
}

function itemRows(items: OrderEmailPayload["items"]): string {
  if (!items || items.length === 0) return "";
  const rows = items
    .map(
      (item) =>
        `<tr><td style="padding:5px 0;font:14px/1.5 Arial,Helvetica,sans-serif;color:#3c403d;">${esc(
          item.name ?? "Item",
        )} × ${esc(item.quantity ?? 1)}</td><td align="right" style="padding:5px 0;font:14px/1.5 Arial,Helvetica,sans-serif;color:#111312;">${naira(
          item.line_total,
        )}</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tbody>${rows}</tbody></table>`;
}

export function renderEmail(template: EmailTemplate, payload: OrderEmailPayload): RenderedEmail {
  const number = payload.order_number ?? "";
  const name = firstName(payload.customer_name);
  const link = trackingUrl(payload);

  switch (template) {
    case "order_received":
      return {
        subject: `Order ${number} received — OCNOO`,
        preheader: "We have your order and the shop can see it now.",
        html: layout({
          title: `Thank you, ${name}. We have your order.`,
          intro: `Order <strong>${esc(
            number,
          )}</strong> is on the shop's dashboard now. Keep the number below — it is how you follow the parcel.`,
          facts: [
            { label: "Order number", value: `<span style="font-family:'Courier New',monospace;">${esc(number)}</span>` },
            { label: "Total", value: naira(payload.total) },
            {
              label: "Payment",
              value: payload.payment_method === "transfer" ? "Bank transfer" : "Paystack",
            },
          ],
          body: itemRows(payload.items),
          cta: { label: "Track this order", href: link },
          note:
            "Bank transfers are confirmed by the shop once the funds are visible in the account. " +
            "A transfer screenshot on its own does not confirm payment.",
        }),
      };

    case "payment_claimed":
      return {
        subject: `We are checking your transfer for ${number}`,
        preheader: "Your declaration reached the shop. Nothing ships until the funds arrive.",
        html: layout({
          title: "Payment declared",
          intro: `We can see that you told us the transfer for order <strong>${esc(
            number,
          )}</strong> has been made. The shop verifies the money in the bank account before anything is packed.`,
          facts: [
            { label: "Order number", value: esc(number) },
            { label: "Amount expected", value: naira(payload.total) },
            { label: "Status", value: "Awaiting verification" },
          ],
          cta: { label: "Track this order", href: link },
          note: `Transfer only to ${esc(BUSINESS.bank.bankName)} · ${esc(
            BUSINESS.bank.accountName,
          )} · ${esc(BUSINESS.bank.accountNumber)}.`,
        }),
      };

    case "payment_confirmed":
      return {
        subject: `Payment confirmed for ${number}`,
        preheader: "The funds are in. The shop is preparing your order.",
        html: layout({
          title: "Payment confirmed",
          intro: `The shop has verified your transfer for order <strong>${esc(
            number,
          )}</strong>. Your items are now being prepared.`,
          facts: [
            { label: "Order number", value: esc(number) },
            { label: "Amount received", value: naira(payload.total) },
            { label: "Payment", value: "Confirmed" },
          ],
          cta: { label: "Track this order", href: link },
        }),
      };

    case "status_changed": {
      const status = payload.status ?? "";
      const label = STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status;
      return {
        subject: `Order ${number} is now ${label.toLowerCase()}`,
        preheader: `Your order has moved on: ${label.toLowerCase()}.`,
        html: layout({
          title: `Your order is ${label.toLowerCase()}`,
          intro: `Order <strong>${esc(number)}</strong> has moved to <strong>${esc(
            label,
          )}</strong>.`,
          facts: [
            { label: "Order number", value: esc(number) },
            { label: "Status", value: esc(label) },
            { label: "Total", value: naira(payload.total) },
          ],
          cta: { label: "Track this order", href: link },
          note:
            status === "dispatched"
              ? "Have the full amount ready — delivery is paid on hand-over in most zones."
              : undefined,
        }),
      };
    }

    case "new_order_admin":
      return {
        subject: `New order ${number} — ${naira(payload.total)}`,
        preheader: "A customer has placed an order on the storefront.",
        html: layout({
          title: "New order on the storefront",
          intro: `Order <strong>${esc(number)}</strong> has just been placed and is on the dashboard.`,
          facts: [
            { label: "Customer", value: esc(payload.customer_name ?? "—") },
            { label: "Phone", value: esc(payload.phone ?? "—") },
            { label: "Total", value: naira(payload.total) },
            {
              label: "Payment",
              value: payload.payment_method === "transfer" ? "Bank transfer" : "Paystack",
            },
          ],
          body: itemRows(payload.items),
          note: "Move the order forward from the admin panel; the customer's tracking page follows automatically.",
        }),
      };
  }
}
