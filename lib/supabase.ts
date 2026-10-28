import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabaseEnv";

/**
 * The storefront talks to the shared Supabase project with the public anon key.
 * That key is safe to ship: row-level security decides what it can read, and it
 * can only write through the two SQL functions the checkout and tracker call.
 */
const url = SUPABASE_URL;
const anonKey = SUPABASE_ANON_KEY;

export { supabaseConfigured };

let browserClient: SupabaseClient | null = null;

/**
 * Client for client components (the event tracker, checkout, track-order).
 * Lazily created so a server render never touches `window`.
 */
export function getBrowserClient(): SupabaseClient | null {
  if (!supabaseConfigured || typeof window === "undefined") return null;
  if (!browserClient) {
    browserClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return browserClient;
}

/**
 * Client for server components. `cache: "no-store"` is what makes "published
 * now, visible now" true: without it Next may serve a cached response for the
 * lifetime of the deployment, and the admin would look broken to the client.
 */
export function getServerClient(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

/**
 * Server-only client that bypasses row-level security, for the outbox worker.
 *
 * This is the one place in either app that uses the service role key, and it is
 * deliberately not reachable from page code: the name has no `NEXT_PUBLIC_`
 * prefix, so Next never inlines it into the bundle, and this module is imported
 * only by a route handler. `email_outbox` has no policies of its own, which is
 * what keeps customer addresses unreadable through the public key - the worker
 * is the single, narrow exception, because it has to read them to mail them.
 *
 * Returns null when the variable is absent so the worker reports "not
 * configured" instead of throwing on a cron hit.
 */
export function getServiceClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseConfigured || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}

/** Public URL for an object in the product photo bucket. */
export const PHOTO_BUCKET = "product-photos";

export function publicPhotoUrl(path: string): string {
  // Empty before the env vars are set: photoSrc() turns that into "no source",
  // and ProductImage renders the placeholder without a doomed network request.
  if (!supabaseConfigured) return "";
  return `${url}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}
