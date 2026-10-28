# OCNOO Online Store — demo storefront

The customer-facing shop (`https://ocnoo.vercel.app`). It reads the catalogue, writes
orders and records anonymous traffic in a **shared Supabase project**; the admin panel in
`../ocnoo-admin` writes the same tables. There is no API server between them — both Next.js
apps call Supabase directly with the public anon key, and row-level security decides what
each role may do.

This is a prototype for a client demo, not a production store: no payment is captured, no
email or SMS is sent, and the free Supabase tier pauses a quiet project after about a week.

## Run it

```bash
cp .env.example .env.local   # then fill in the two values
npm install
npm run dev                  # http://localhost:3000
```

| Variable | Required | What it is |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes* | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes* | The project's anon/public key |

\* Without them the shop still renders the built-in fallback catalogue in
`data/products.ts`, so UI work needs no project. Checkout, tracking and traffic counts only
work against a real one.

## First-time Supabase setup

Do this once, before either app is deployed.

1. Create a free project at supabase.com.
2. SQL editor → paste `supabase/schema.sql` → run. It creates the tables, the two
   storefront write paths (`place_order`, `track_order`), the admin RPCs, every RLS policy,
   the `product-photos` bucket and the realtime publication.
3. SQL editor → paste `supabase/seed.sql` → run. Loads the 24 products (published) and a
   few demo orders, so neither the shop nor the dashboard opens empty.
4. Authentication → Users → create **one** admin user (email + password). There is no
   signup screen.
5. Copy the project URL and anon key into `.env.local` here **and** in `../ocnoo-admin`,
   then the same two values into both Vercel projects.

## Deploy

Vercel or any Next.js host. This app renders on the server and reads Supabase per request,
so it needs the Node runtime — a static export will not work.

This directory is its own repository root (`ocnoo-demo/.git`), so import it directly with
no sub-directory configuration.

1. **Environment variables**, set for Production, Preview *and* Development:

   | Name | Needed | Notes |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | always | the same project the admin panel uses |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | always | public by design; RLS is the gate |
   | `NEXT_PUBLIC_SITE_URL` | recommended | canonical, OG, sitemap and email links. Without it a preview URL is used |
   | `SUPABASE_SERVICE_ROLE_KEY` | order email only | **server-only — never with a `NEXT_PUBLIC_` prefix** |
   | `BREVO_API_KEY`, `BREVO_FROM_EMAIL` | order email only | the sending address must be on a domain verified in Brevo |
   | `BREVO_ADMIN_EMAIL` | optional | where new-order alerts go; defaults to `BREVO_FROM_EMAIL` |
   | `CRON_SECRET` | order email only | guards `/api/worker/outbox`; the route answers 503 to everyone without it |

   `NEXT_PUBLIC_*` values are inlined into the bundle at build time. Adding them after a
   deploy changes nothing until you redeploy — which is exactly how a shop ends up serving
   the built-in demo catalogue from a live domain.

2. **Supabase → Authentication → URL Configuration**: set Site URL to the production origin.

3. **Supabase → Authentication → turn off "Allow new users to sign up".** The policies in
   `supabase/schema.sql` treat every `authenticated` JWT as a shop admin, and the storefront
   creates no auth users of its own. Leaving sign-ups open means anyone can register with the
   public anon key and read every order.

4. **Order email** (optional). `vercel.json` registers a cron that calls
   `/api/worker/outbox` every ten minutes; the worker drains `public.email_outbox` through
   Brevo. Rows are queued by the SQL order functions inside the same transaction as the order,
   so an unconfigured worker loses nothing — it just holds the mail until it is configured.
   Vercel's Hobby plan runs one cron schedule; a manual `curl` with
   `Authorization: Bearer $CRON_SECRET` flushes the queue on demand.

5. Deploy, then walk the demo script below against the live URL.

## Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # next lint
npm run build       # production build
```

## How the pieces fit

- **Catalogue** — `lib/catalog.ts` reads published products on the server, once per request
  (`export const dynamic = "force-dynamic"` in the root layout). That is what makes
  "published now, visible now" true without a cache to purge between two deployments.
- **Client islands** — `context/CatalogProvider.tsx` hands the same catalogue to the cart,
  the saved list and anything else that only stores ids. No second fetch.
- **Photos** — products store Storage object paths; `components/product/ProductImage.tsx`
  builds the public URL and falls back to the placeholder frame if the object is gone.
- **Checkout** — `lib/orders.ts` calls `place_order(payload jsonb)`. Prices, delivery fee,
  totals and stock are recomputed inside SQL; a refusal (sold out, unpublished) is shown to
  the customer and logged once as a `checkout_error` event.
- **Payment** — `payment_status` (`awaiting` → `claimed` → `confirmed`) runs beside the
  delivery ladder, not inside it. The customer declares a transfer with
  `claim_payment(number, token)`; only the shop can `confirm_payment(number)`, and that RPC is
  granted to `authenticated` alone. A declaration is never presented as a verified payment.
- **Tracking** — number + phone goes through `track_order`, which redirects to
  `/track-order/<number>?t=<token>`. The token is random per order and validated on the
  server, so a guessed order number opens nothing.
- **Traffic** — `components/analytics/EventsTracker.tsx` sends `page_view` / `product_view`
  with a sessionStorage id, and the cart sends `add_to_cart`. No cookies, no personal data.

## Demo script

1. In the admin panel, publish a product with a photo and stock 3.
2. Open `/shop` — it is there, with the real photo.
3. Add it to the cart and check out on another device (or a private window). The order
   number appears on the admin dashboard within seconds and stock drops to 2.
4. Enter that order number and your phone on `/track-order` — the status shows.
5. In the admin, mark the order **Packed**; reload the customer's track page.
6. Unpublish the product — it leaves the shop and its page 404s.
7. The dashboard shows today's visits and the most-viewed product.

## Deliberate limits

- The free Supabase tier pauses a project after roughly 7 days of inactivity. Open the
  site the morning of a client meeting to wake it.
- `paystack` / `transfer` are labels on the order; no money moves.
- One admin account, no roles, no audit trail beyond `order_events`.
- Catalogue routes render per request, so first paint is slightly slower than a static
  build. That is the price of instant publishing.
