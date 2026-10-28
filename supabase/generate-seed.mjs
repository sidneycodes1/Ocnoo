// Generates supabase/seed.sql from the storefront's static catalogue, so the
// live database starts with exactly the products ocnoo.vercel.app shows today.
//
// Run from this folder:  node generate-seed.mjs
// Re-run whenever data/products.ts changes BEFORE the first deploy; after that
// the panel owns the catalogue and re-seeding is not wanted.
import { readFile, writeFile, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "..", "data", "products.ts");
const tempPath = join(here, ".seed-products.mjs");

const source = await readFile(sourcePath, "utf8");
// Only the array literal is plain data; the rest of the file is typed helpers.
const match = source.match(/export const products[^=]*=([\s\S]*?)\r?\n\];/);
if (!match) throw new Error("Could not find the products array in data/products.ts");
const asModule = `export const products =${match[1]}\n];\n`;

await writeFile(tempPath, asModule, "utf8");
const { products } = await import(`file://${tempPath}?v=${Date.now()}`);
await unlink(tempPath);

const rows = products.map((product, index) => ({
  seq: index,
  slug: product.slug,
  name: product.name,
  price: product.price,
  compare_at: product.oldPrice ?? null,
  category: product.category,
  description: product.description,
  brand: product.brand ?? null,
  condition: product.condition ?? null,
  badge: product.badge ?? null,
  stock_qty: product.stockQty ?? (product.inStock ? 10 : 0),
  rating: product.rating ?? null,
  review_count: product.reviewCount ?? null,
  specs: product.specs ?? [],
}));

const json = JSON.stringify(rows, null, 2);

const orders = [
  {
    number: "OCN-48201",
    name: "Chinedu Okafor",
    phone: "0803 123 4567",
    address: "18 Adeola Odeku Street, Victoria Island",
    state: "Lagos",
    zone: "A",
    payment: "paystack",
    status: "placed",
    hoursAgo: 3,
    items: [["Samsung Galaxy A54", 320000, 1]],
  },
  {
    number: "OCN-48202",
    name: "Aisha Bello",
    phone: "0906 555 1212",
    address: "7 Ahmadu Bello Way, Wuse II",
    state: "Federal Capital Territory",
    zone: "B",
    payment: "transfer",
    status: "packed",
    hoursAgo: 54,
    items: [
      ["HP Pavilion 15 Laptop", 720000, 1],
      ["Anker 20,000mAh Power Bank", 45000, 1],
    ],
  },
  {
    number: "OCN-48203",
    name: "Tunde Adeyemi",
    phone: "0814 222 8899",
    address: "42 Ring Road, Ibadan",
    state: "Oyo",
    zone: "A",
    payment: "paystack",
    status: "dispatched",
    hoursAgo: 30,
    items: [
      ["Casio FX-991 Calculator", 12500, 1],
      ["ORICO 7-in-1 USB-C Hub", 28000, 1],
    ],
  },
  {
    number: "OCN-48204",
    name: "Ngozi Eze",
    phone: "0705 431 0022",
    address: "3 Ogui Road, Enugu",
    state: "Enugu",
    zone: "B",
    payment: "transfer",
    status: "delivered",
    hoursAgo: 192,
    items: [["Scanfrost 2L Blender", 65000, 1]],
  },
  {
    number: "OCN-48205",
    name: "Emeka Obi",
    phone: "0902 778 3344",
    address: "11 Aba Road, Port Harcourt",
    state: "Rivers",
    zone: "B",
    payment: "paystack",
    status: "cancelled",
    hoursAgo: 240,
    items: [["Philips Rechargeable Standing Fan", 35000, 1]],
  },
];

function sqlText(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const orderBlocks = orders
  .map((order) => {
    const subtotal = order.items.reduce((sum, [, price, qty]) => sum + price * qty, 0);
    const fee = order.zone === "A" ? 2500 : order.zone === "B" ? 4500 : 6500;
    const total = subtotal + fee;
    const placed = `now() - interval '${order.hoursAgo} hours'`;
    const cancelled = order.status === "cancelled";
    const events = [
      `('${order.number}', 'placed', 'Order placed on the storefront', ${placed})`,
      ...(order.status !== "placed" && !cancelled
        ? order.status === "delivered"
          ? [
              `('${order.number}', 'packed', null, ${placed} + interval '4 hours')`,
              `('${order.number}', 'dispatched', null, ${placed} + interval '24 hours')`,
              `('${order.number}', 'delivered', null, ${placed} + interval '48 hours')`,
            ]
          : order.status === "dispatched"
            ? [
                `('${order.number}', 'packed', null, ${placed} + interval '2 hours')`,
                `('${order.number}', 'dispatched', null, ${placed} + interval '20 hours')`,
              ]
            : [`('${order.number}', 'packed', null, ${placed} + interval '2 hours')`]
        : []),
      ...(cancelled
        ? [`('${order.number}', 'cancelled', 'Customer changed their mind', ${placed} + interval '1 hour')`]
        : []),
    ];
    const items = order.items
      .map(
        ([name, price, qty]) =>
          `('${order.number}', ${sqlText(name)}, ${price}, ${qty}, ${price * qty})`,
      )
      .join(",\n    ");

    return `-- ${order.number} | ${order.name} (${order.status})
insert into public.orders (order_number, customer_name, phone, address, state, zone, payment_method, subtotal, delivery_fee, total, status, placed_at, cancelled_at, cancelled_from)
values (
  '${order.number}', ${sqlText(order.name)}, ${sqlText(order.phone)}, ${sqlText(order.address)},
  ${sqlText(order.state)}, '${order.zone}', '${order.payment}', ${subtotal}, ${fee}, ${total},
  '${order.status}', ${placed},
  ${cancelled ? `${placed} + interval '1 hour'` : "null"},
  ${cancelled ? "'placed'" : "null"}
)
on conflict (order_number) do nothing;

insert into public.order_items (order_number, name, unit_price, quantity, line_total)
select v.* from (values
    ${items}
  ) as v(order_number, name, unit_price, quantity, line_total)
where not exists (
  select 1 from public.order_items where order_number = '${order.number}'
);

insert into public.order_events (order_number, status, note, created_at)
select * from (values
    ${events.join(",\n    ")}
  ) as v(order_number, status, note, created_at)
where not exists (
  select 1 from public.order_events where order_number = '${order.number}'
);
`;
  })
  .join("\n");

const sql = `-- OCNOO demo data - generated by generate-seed.mjs from data/products.ts.
-- Run after schema.sql on a fresh project. Safe to re-run: every insert is
-- guarded, so it never duplicates or overwrites work done in the panel.

insert into public.products (
  slug, name, price, compare_at, category, description, brand, condition,
  badge, stock_qty, low_stock_at, specs, images, rating, review_count,
  status, published_at
)
select
  x.slug, x.name, x.price, x.compare_at, x.category, x.description, x.brand,
  x.condition, x.badge, x.stock_qty, 5, x.specs, '[]'::jsonb,
  x.rating, x.review_count, 'published',
  now() - (x.seq || ' days')::interval
from jsonb_to_recordset($ocnoo$${json}$ocnoo$::jsonb)
  as x(seq int, slug text, name text, price int, compare_at int, category text,
       description text, brand text, condition text, badge text, stock_qty int,
       rating numeric, review_count int, specs jsonb)
on conflict (slug) do nothing;

${orderBlocks}
`;

await writeFile(join(here, "seed.sql"), sql, "utf8");
console.log(`seed.sql written: ${rows.length} products, ${orders.length} orders`);

