-- OCNOO shared database — schema, rules and the only write paths the two
-- apps are allowed to use.
--
-- Paste this file into the Supabase SQL editor ONCE, on a fresh project, then
-- run seed.sql. It is written to be re-runnable: every object is created with
-- `if not exists` / `or replace`, and policies are dropped before re-creation.
--
-- The two apps (storefront + admin panel) talk to this project directly with
-- the public anon key. Nothing here trusts the browser: prices, stock and
-- order totals are recomputed in SQL, and the anon role can only read
-- published products.

-- Supabase installs extensions into their own `extensions` schema, and every
-- security-definer function below pins its own search_path. A function that
-- pins `search_path = public` therefore cannot see an unqualified
-- `gen_random_bytes`, and fails at run time with SQL error 42883 — not at
-- create time. pgcrypto calls are schema-qualified for that reason.
create extension if not exists pgcrypto with schema extensions;

-- Order numbers stay in the OCN-48xxx range the demo has always shown.
create sequence if not exists public.order_number_seq start with 48210;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  -- Whole naira. The storefront formats; it never stores decimals.
  price integer not null check (price >= 0),
  compare_at integer check (compare_at is null or compare_at > price),
  category text not null,
  description text not null default '',
  brand text,
  sku text,
  condition text check (condition in ('New', 'Used', 'Unopened')),
  badge text check (badge in ('New', 'Deal', 'Pre-Order')),
  -- Content state, separate from stock. A published product with 0 units is
  -- still published; it is simply not buyable.
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  stock_qty integer not null default 0 check (stock_qty >= 0),
  low_stock_at integer not null default 3 check (low_stock_at >= 0),
  featured boolean not null default false,
  -- [{label, value}] and ["path/in/product-photos.jpg"]. Paths, not URLs, so
  -- the project can move without rewriting rows.
  specs jsonb not null default '[]'::jsonb,
  images jsonb not null default '[]'::jsonb,
  -- Demo ratings carried over from the static catalogue; the panel does not
  -- edit them and the storefront treats them as optional.
  rating numeric(2,1),
  review_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  archived_at timestamptz
);

create index if not exists products_status_published_idx
  on public.products (status, published_at desc);
create index if not exists products_category_idx on public.products (category);

create table if not exists public.orders (
  order_number text primary key,
  -- Random per order. The tracking URL carries it, so a guessed order number
  -- is not enough to read someone else's address.
  track_token text not null default encode(extensions.gen_random_bytes(8), 'hex'),
  customer_name text not null,
  phone text not null,
  -- Optional on the row so orders placed before notifications existed stay
  -- valid. Checkout asks for it; the email worker skips rows without one.
  customer_email text,
  address text not null,
  state text not null,
  zone text not null check (zone in ('A', 'B', 'C')),
  payment_method text not null check (payment_method in ('paystack', 'transfer')),
  -- Orthogonal to the delivery ladder below: a bank transfer is declared by the
  -- customer and verified by the shop, and neither changes where the parcel is.
  payment_status text not null default 'awaiting'
    check (payment_status in ('awaiting', 'claimed', 'confirmed')),
  paid_at timestamptz,
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  total integer not null default 0,
  status text not null default 'placed'
    check (status in ('placed', 'packed', 'dispatched', 'delivered', 'cancelled')),
  placed_at timestamptz not null default now(),
  cancelled_at timestamptz,
  cancelled_from text
);

create index if not exists orders_status_placed_idx
  on public.orders (status, placed_at desc);
create index if not exists orders_placed_idx on public.orders (placed_at desc);

-- `create table if not exists` is a no-op against a database that already has
-- the table, so everything above only reaches a fresh project. These statements
-- carry the same changes onto a project that was set up before they existed,
-- which keeps this one file correct for both. Each is idempotent.
alter table public.orders alter column track_token
  set default encode(extensions.gen_random_bytes(8), 'hex');
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists payment_status text
  not null default 'awaiting'
  check (payment_status in ('awaiting', 'claimed', 'confirmed'));
alter table public.orders add column if not exists paid_at timestamptz;

create table if not exists public.order_items (
  id bigserial primary key,
  order_number text not null references public.orders (order_number) on delete cascade,
  -- Null when the product was deleted later; the name/price snapshot below is
  -- what the customer actually bought.
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  line_total integer not null
);

create index if not exists order_items_order_idx on public.order_items (order_number);

create table if not exists public.order_events (
  id bigserial primary key,
  order_number text not null references public.orders (order_number) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_events_order_idx on public.order_events (order_number, created_at);

-- Anonymous traffic counters. No cookies, no user agent, no IP.
create table if not exists public.site_events (
  id bigserial primary key,
  kind text not null check (kind in ('page_view', 'product_view', 'add_to_cart', 'checkout_error')),
  path text,
  product_id uuid references public.products (id) on delete set null,
  session_id text,
  created_at timestamptz not null default now()
);

create index if not exists site_events_created_idx on public.site_events (created_at desc);
create index if not exists site_events_kind_idx on public.site_events (kind, created_at desc);

-- ---------------------------------------------------------------------------
-- Outbound email queue
--
-- Rows are inserted by the order functions themselves, inside the same
-- transaction as the order write. That is the whole point: if the order exists,
-- the notification is queued, and a browser tab closing before a request lands
-- cannot lose it. A worker route drains the table afterwards.
--
-- `to_email` is null for shop-owner mail, which is addressed from the worker's
-- own configuration rather than stored here.
-- ---------------------------------------------------------------------------

create table if not exists public.email_outbox (
  id bigserial primary key,
  template text not null
    check (template in ('order_received', 'payment_claimed', 'payment_confirmed', 'status_changed', 'new_order_admin')),
  to_email text,
  recipient_role text not null default 'customer'
    check (recipient_role in ('customer', 'admin')),
  order_number text references public.orders (order_number) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists email_outbox_pending_idx
  on public.email_outbox (status, created_at);
create index if not exists email_outbox_order_idx on public.email_outbox (order_number);

-- `updated_at` is owned by the database so the panel cannot forget it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists products_touch_updated_at on public.products;
create trigger products_touch_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storefront write path: one transaction per order
-- ---------------------------------------------------------------------------

create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_name text := trim(coalesce(payload->'customer'->>'name', ''));
  v_phone text := trim(coalesce(payload->'customer'->>'phone', ''));
  v_email text := lower(trim(coalesce(payload->'customer'->>'email', '')));
  v_address text := trim(coalesce(payload->'customer'->>'address', ''));
  v_state text := trim(coalesce(payload->'customer'->>'state', ''));
  v_zone text := upper(coalesce(payload->>'zone', 'C'));
  v_payment text := coalesce(payload->>'payment', '');
  v_fee integer;
  v_order_number text;
  v_token text;
  v_subtotal integer := 0;
  v_item record;
  v_product record;
  v_qty integer;
  v_line_total integer;
  v_item_count integer := 0;
begin
  if v_name = '' or v_phone = '' or v_address = '' or v_state = '' then
    raise exception 'MISSING_CUSTOMER';
  end if;
  if v_payment not in ('paystack', 'transfer') then
    raise exception 'BAD_PAYMENT';
  end if;
  -- Presence is not enforced here: the checkout form makes the field required,
  -- and refusing a paid order over a missing address would lose a sale the shop
  -- could still fulfil by phone. Format is enforced, because a typo'd address
  -- would fail silently and nobody would ever see the confirmation.
  if v_email <> '' and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'BAD_EMAIL';
  end if;
  if v_zone not in ('A', 'B', 'C') then
    v_zone := 'C';
  end if;
  if jsonb_typeof(payload->'items') <> 'array' or jsonb_array_length(payload->'items') = 0 then
    raise exception 'EMPTY_ORDER';
  end if;

  -- Mirrors lib/delivery.ts. Kept here as well because the browser's total is
  -- never trusted for money.
  v_fee := case v_zone when 'A' then 2500 when 'B' then 4500 else 6500 end;
  v_order_number := 'OCN-' || nextval('public.order_number_seq');
  v_token := encode(extensions.gen_random_bytes(8), 'hex');

  insert into public.orders (
    order_number, track_token, customer_name, phone, customer_email, address, state, zone, payment_method
  ) values (
    v_order_number, v_token, v_name, v_phone, nullif(v_email, ''), v_address, v_state, v_zone, v_payment
  );

  for v_item in
    select * from jsonb_to_recordset(payload->'items')
      as x(product_id uuid, quantity integer)
  loop
    v_qty := greatest(1, coalesce(v_item.quantity, 1));

    -- FOR UPDATE serialises two customers buying the last unit at once.
    select id, name, price, stock_qty, status
      into v_product
      from public.products
      where id = v_item.product_id
      for update;

    if not found then
      raise exception 'PRODUCT_MISSING';
    end if;
    if v_product.status <> 'published' then
      raise exception 'PRODUCT_UNAVAILABLE:%', v_product.name;
    end if;
    if v_product.stock_qty < v_qty then
      raise exception 'OUT_OF_STOCK:%', v_product.name;
    end if;

    v_line_total := v_product.price * v_qty;
    insert into public.order_items (order_number, product_id, name, unit_price, quantity, line_total)
    values (v_order_number, v_product.id, v_product.name, v_product.price, v_qty, v_line_total);

    update public.products
      set stock_qty = stock_qty - v_qty
      where id = v_product.id;

    v_subtotal := v_subtotal + v_line_total;
    v_item_count := v_item_count + 1;
  end loop;

  if v_item_count = 0 then
    raise exception 'EMPTY_ORDER';
  end if;

  update public.orders
    set subtotal = v_subtotal,
        delivery_fee = v_fee,
        total = v_subtotal + v_fee
    where order_number = v_order_number;

  insert into public.order_events (order_number, status, note)
  values (v_order_number, 'placed', 'Order placed on the storefront');

  -- Queued in the same transaction as the order itself. An order without a
  -- queued confirmation is not possible; a closed browser tab cannot lose it.
  if v_email <> '' then
    insert into public.email_outbox (template, to_email, order_number, payload)
    values ('order_received', v_email, v_order_number, jsonb_build_object(
      'order_number', v_order_number,
      'customer_name', v_name,
      'total', v_subtotal + v_fee,
      'payment_method', v_payment,
      'payment_status', 'awaiting',
      'track_token', v_token,
      'items', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'name', i.name, 'quantity', i.quantity, 'line_total', i.line_total
        ) order by i.id), '[]'::jsonb)
        from public.order_items i where i.order_number = v_order_number
      )
    ));
  end if;

  -- The shop owner is told about every order, whether or not the buyer left an
  -- email. The address comes from the worker's configuration, not this row.
  insert into public.email_outbox (template, recipient_role, order_number, payload)
  values ('new_order_admin', 'admin', v_order_number, jsonb_build_object(
    'order_number', v_order_number,
    'customer_name', v_name,
    'phone', v_phone,
    'total', v_subtotal + v_fee,
    'payment_method', v_payment
  ));

  return jsonb_build_object(
    'order_number', v_order_number,
    'track_token', v_token,
    'subtotal', v_subtotal,
    'delivery_fee', v_fee,
    'total', v_subtotal + v_fee,
    'payment_status', 'awaiting',
    'placed_at', now()
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Storefront read path: tracking requires the phone, or the order token
-- ---------------------------------------------------------------------------

create or replace function public.order_payload(p_order public.orders)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'order_number', o.order_number,
    'track_token', o.track_token,
    'customer_name', o.customer_name,
    'phone', o.phone,
    'customer_email', o.customer_email,
    'address', o.address,
    'state', o.state,
    'zone', o.zone,
    'payment_method', o.payment_method,
    'payment_status', o.payment_status,
    'paid_at', o.paid_at,
    'subtotal', o.subtotal,
    'delivery_fee', o.delivery_fee,
    'total', o.total,
    'status', o.status,
    'placed_at', o.placed_at,
    'cancelled_at', o.cancelled_at,
    'cancelled_from', o.cancelled_from,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name', i.name,
        'unit_price', i.unit_price,
        'quantity', i.quantity,
        'line_total', i.line_total
      ) order by i.id)
      from public.order_items i
      where i.order_number = o.order_number
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'status', e.status,
        'note', e.note,
        'at', e.created_at
      ) order by e.created_at)
      from public.order_events e
      where e.order_number = o.order_number
    ), '[]'::jsonb)
  )
  from public.orders o
  where o.order_number = p_order.order_number;
$$;

create or replace function public.track_order(p_number text, p_phone text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  -- Last 10 digits compare equal across "0803…", "+234803…" and spaced input.
  select * into v_order
    from public.orders
    where upper(order_number) = upper(trim(p_number))
      and right(regexp_replace(phone, '\D', '', 'g'), 10)
        = right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);

  if not found then
    return null;
  end if;
  return public.order_payload(v_order);
end;
$$;

create or replace function public.track_order_by_token(p_number text, p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order
    from public.orders
    where upper(order_number) = upper(trim(p_number))
      and track_token = trim(coalesce(p_token, ''));

  if not found then
    return null;
  end if;
  return public.order_payload(v_order);
end;
$$;

create or replace function public.cancel_my_order(p_number text, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order
    from public.orders
    where upper(order_number) = upper(trim(p_number))
      and track_token = trim(coalesce(p_token, ''))
      for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'NOT_FOUND');
  end if;
  if v_order.status not in ('placed', 'packed') then
    return jsonb_build_object('ok', false, 'reason', 'TOO_LATE');
  end if;

  update public.orders
    set status = 'cancelled',
        cancelled_at = now(),
        cancelled_from = v_order.status
    where order_number = v_order.order_number;

  -- Put the units back. A cancelled order never shipped, so leaving stock
  -- decremented would let a cancellation make a product look sold out.
  update public.products p
    set stock_qty = p.stock_qty + i.quantity
    from public.order_items i
    where i.order_number = v_order.order_number
      and i.product_id = p.id;

  insert into public.order_events (order_number, status, note)
  values (v_order.order_number, 'cancelled', 'Cancelled by the customer');

  return jsonb_build_object('ok', true, 'status', 'cancelled');
end;
$$;

-- ---------------------------------------------------------------------------
-- Payment: the customer declares a bank transfer, the shop verifies the funds
-- ---------------------------------------------------------------------------

create or replace function public.claim_payment(p_number text, p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.orders;
begin
  -- Same token rule as cancel_my_order: knowing the order number is not enough,
  -- the caller must hold the tracking token from the confirmation link.
  select * into v_order
    from public.orders
    where upper(order_number) = upper(trim(p_number))
      and track_token = trim(coalesce(p_token, ''))
      for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'NOT_FOUND');
  end if;
  if v_order.status = 'cancelled' then
    return jsonb_build_object('ok', false, 'reason', 'CANCELLED');
  end if;
  -- Idempotent. The confirmation screen can be reloaded or double-tapped, and a
  -- second click must not write a second event or queue a second email.
  if v_order.payment_status <> 'awaiting' then
    return jsonb_build_object('ok', true, 'payment_status', v_order.payment_status, 'already', true);
  end if;

  update public.orders
    set payment_status = 'claimed', paid_at = now()
    where order_number = v_order.order_number;

  insert into public.order_events (order_number, status, note)
  values (v_order.order_number, 'payment_claimed', 'Customer says the transfer was made');

  if v_order.customer_email is not null then
    insert into public.email_outbox (template, to_email, order_number, payload)
    values ('payment_claimed', v_order.customer_email, v_order.order_number, jsonb_build_object(
      'order_number', v_order.order_number,
      'customer_name', v_order.customer_name,
      'total', v_order.total,
      'track_token', v_order.track_token
    ));
  end if;

  return jsonb_build_object('ok', true, 'payment_status', 'claimed', 'paid_at', now());
end;
$$;

create or replace function public.confirm_payment(p_number text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order public.orders;
begin
  select * into v_order
    from public.orders
    where upper(order_number) = upper(trim(p_number))
    for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'ORDER_MISSING');
  end if;
  -- Only a declared transfer can be confirmed. Confirming something nobody
  -- claimed would invent a payment the customer never announced.
  if v_order.payment_status <> 'claimed' then
    return jsonb_build_object('ok', false, 'reason', 'NOT_CLAIMED');
  end if;

  update public.orders
    set payment_status = 'confirmed'
    where order_number = v_order.order_number;

  insert into public.order_events (order_number, status, note)
  values (v_order.order_number, 'payment_confirmed', 'Transfer verified by the shop');

  if v_order.customer_email is not null then
    insert into public.email_outbox (template, to_email, order_number, payload)
    values ('payment_confirmed', v_order.customer_email, v_order.order_number, jsonb_build_object(
      'order_number', v_order.order_number,
      'customer_name', v_order.customer_name,
      'total', v_order.total,
      'track_token', v_order.track_token
    ));
  end if;

  return jsonb_build_object('ok', true, 'payment_status', 'confirmed');
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin write paths: the ladder is enforced here, not in the browser
-- ---------------------------------------------------------------------------

create or replace function public.advance_order(p_number text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_next text;
  v_name text;
  v_email text;
  v_token text;
begin
  select status, customer_name, customer_email, track_token
    into v_status, v_name, v_email, v_token
    from public.orders
    where order_number = p_number
    for update;

  if not found then
    raise exception 'ORDER_MISSING';
  end if;

  v_next := case v_status
    when 'placed' then 'packed'
    when 'packed' then 'dispatched'
    when 'dispatched' then 'delivered'
    else null
  end;
  if v_next is null then
    raise exception 'NOT_ADVANCEABLE';
  end if;

  update public.orders set status = v_next where order_number = p_number;
  insert into public.order_events (order_number, status) values (p_number, v_next);

  -- Every ladder step tells the buyer something, which is exactly the email
  -- Jumia-style stores send. Queued here rather than from the admin's browser so
  -- a closed tab cannot swallow a "out for delivery" notice.
  if v_email is not null then
    insert into public.email_outbox (template, to_email, order_number, payload)
    values ('status_changed', v_email, p_number, jsonb_build_object(
      'order_number', p_number,
      'customer_name', v_name,
      'status', v_next,
      'track_token', v_token
    ));
  end if;

  return v_next;
end;
$$;

create or replace function public.cancel_order_admin(p_number text, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where order_number = p_number for update;
  if not found then
    raise exception 'ORDER_MISSING';
  end if;
  if v_order.status not in ('placed', 'packed') then
    raise exception 'TOO_LATE';
  end if;

  update public.orders
    set status = 'cancelled',
        cancelled_at = now(),
        cancelled_from = v_order.status
    where order_number = p_number;

  -- Same stock restore as the customer path: this cancel can only fire before
  -- dispatch, so the units were never shipped.
  update public.products p
    set stock_qty = p.stock_qty + i.quantity
    from public.order_items i
    where i.order_number = p_number
      and i.product_id = p.id;

  insert into public.order_events (order_number, status, note)
  values (p_number, 'cancelled', nullif(trim(coalesce(p_note, '')), ''));

  return jsonb_build_object('ok', true, 'cancelled_from', v_order.status);
end;
$$;

-- Functions are executable by everyone by default; close that.
revoke all on function public.advance_order(text) from public, anon;
revoke all on function public.cancel_order_admin(text, text) from public, anon;
grant execute on function public.advance_order(text) to authenticated;
grant execute on function public.cancel_order_admin(text, text) to authenticated;

revoke all on function public.place_order(jsonb) from public;
revoke all on function public.track_order(text, text) from public;
revoke all on function public.track_order_by_token(text, text) from public;
revoke all on function public.cancel_my_order(text, text) from public;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.track_order(text, text) to anon, authenticated;
grant execute on function public.track_order_by_token(text, text) to anon, authenticated;
grant execute on function public.cancel_my_order(text, text) to anon, authenticated;

-- Declaring a payment belongs to whoever holds the tracking token; verifying it
-- belongs to the shop alone.
revoke all on function public.claim_payment(text, text) from public;
grant execute on function public.claim_payment(text, text) to anon, authenticated;
revoke all on function public.confirm_payment(text) from public, anon;
grant execute on function public.confirm_payment(text) to authenticated;

-- The payload builder takes a whole order row and does not check who is asking;
-- it is only ever called from the security-definer functions above.
revoke all on function public.order_payload(public.orders) from public, anon;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;
alter table public.site_events enable row level security;
alter table public.email_outbox enable row level security;

-- Deliberately no policy on email_outbox: it holds customer addresses, so the
-- anon key can neither read nor write it directly. The order functions reach it
-- as definer (they run as the owner, which bypasses row-level security), and
-- only the server-side worker — which authenticates as the service role — can
-- list and update queued mail.

drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select to anon
  using (status = 'published');

drop policy if exists products_admin_all on public.products;
create policy products_admin_all on public.products
  for all to authenticated
  using (true) with check (true);

-- No anon policy on orders/order_items/order_events: customers read their own
-- order through the security-definer functions above, which return only when
-- the phone or the per-order token matches. The admin account gets full access.
drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all on public.orders
  for all to authenticated using (true) with check (true);

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all on public.order_items
  for all to authenticated using (true) with check (true);

drop policy if exists order_events_admin_all on public.order_events;
create policy order_events_admin_all on public.order_events
  for all to authenticated using (true) with check (true);

drop policy if exists site_events_anon_insert on public.site_events;
create policy site_events_anon_insert on public.site_events
  for insert to anon, authenticated with check (true);

drop policy if exists site_events_admin_read on public.site_events;
create policy site_events_admin_read on public.site_events
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- Photo storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-photos',
  'product-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set public = excluded.public;

drop policy if exists product_photos_public_read on storage.objects;
create policy product_photos_public_read on storage.objects
  for select to public
  using (bucket_id = 'product-photos');

drop policy if exists product_photos_admin_insert on storage.objects;
create policy product_photos_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-photos');

drop policy if exists product_photos_admin_update on storage.objects;
create policy product_photos_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'product-photos');

drop policy if exists product_photos_admin_delete on storage.objects;
create policy product_photos_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-photos');

-- ---------------------------------------------------------------------------
-- Live orders for the dashboard
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
end;
$$;
