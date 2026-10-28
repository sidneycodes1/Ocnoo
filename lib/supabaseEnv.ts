/**
 * The two public Supabase values, kept in their own module so client code that
 * only needs to POST to PostgREST (the event tracker) does not pull the whole
 * `@supabase/supabase-js` client into the shared bundle.
 *
 * `NEXT_PUBLIC_*` is inlined by Next at build time, so this is a compile-time
 * constant on the client, not a runtime lookup.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** False before the two env vars are set, so the app can say so instead of crashing. */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
