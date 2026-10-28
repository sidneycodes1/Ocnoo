import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  supabaseConfigured,
} from "@/lib/supabaseEnv";

export type SiteEventKind =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_error";

const SESSION_KEY = "ocnoo-session";

/** Postgres will reject a non-uuid product id, so the seed fallback skips it. */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One id per browser tab. sessionStorage, not a cookie: it dies with the tab,
 * carries no personal data, and needs no consent banner. Traffic is counted in
 * visits, not in people, which is what the dashboard claims.
 */
function sessionId(): string | null {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      window.crypto?.randomUUID?.() ??
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Storage blocked (private mode, quota). Drop the event rather than retry
    // forever; analytics must never break the page it is measuring.
    return null;
  }
}

/**
 * Fire-and-forget traffic event, written straight to PostgREST.
 *
 * Deliberately not through `@supabase/supabase-js`: this runs in the root
 * layout, and shipping the whole client to every visitor to insert one row is a
 * poor trade. The anon key is public, RLS on `site_events` allows insert only,
 * and nothing waits for the result - a dropped counter must never interrupt a
 * shopper.
 */
export function trackEvent(
  kind: SiteEventKind,
  options: { path?: string; productId?: string } = {}
): void {
  if (!supabaseConfigured) return;
  const session = sessionId();
  if (!session) return;

  const body = JSON.stringify({
    kind,
    path: options.path ?? window.location.pathname,
    product_id:
      options.productId && UUID_RE.test(options.productId)
        ? options.productId
        : null,
    session_id: session,
  });

  void fetch(`${SUPABASE_URL}/rest/v1/site_events`, {
    method: "POST",
    // `keepalive` lets the request finish after the shopper has navigated away,
    // which is when most page views are sent.
    keepalive: true,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body,
  })
    .then((response) => {
      if (!response.ok) {
        console.warn(`[events] ${kind} not recorded (${response.status})`);
      }
    })
    .catch(() => {
      /* offline or blocked: the page never learns about it */
    });
}
