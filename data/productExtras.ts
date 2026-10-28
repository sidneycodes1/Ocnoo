import type { Product, ProductExtras, ResolvedExtras, SellerInfo } from "@/types";
import { getCategoryBySlug } from "@/data/categories";

// ============================================================================
// ⚠ EVERYTHING IN THIS FILE IS PROTOTYPE COPY.
//
// The long-form paragraphs, key-feature bullets, box contents, SKUs, coupon
// amounts, seller score and follower counts below are written to make the
// product page's information architecture testable. None of it is a quoted
// OCNOO specification, price, guarantee or performance record. Same standing as
// the placeholder fees in lib/delivery.ts: replace with real listing data
// before anything here faces a customer.
//
// Two tiers, deliberately:
//   1. `productExtras` — hand-written for six flagship listings, one per
//      category group, so the page can be judged against a real reference.
//   2. `buildFallback` — for every other listing. It RESTATES fields the
//      product already has (name, description, specs, condition) and invents
//      nothing. A generated page reads flatter than a hand-written one, which
//      is the point: it is obvious at a glance which listings still need copy.
// ============================================================================

/**
 * The seller block. OCNOO is a single-vendor store, so this describes the shop
 * itself rather than a cast of fictional third-party sellers — a marketplace
 * card that implies other vendors are trading here would misrepresent the
 * business. `scorePct` and `followers` are demo figures.
 */
export const OCNOO_STORE: SellerInfo = {
  name: "OCNOO",
  tagline: "Sold and shipped by King Ocnoo Computer Ventures",
  scorePct: 92,
  followers: 148,
  performance: [
    { label: "Delivery speed", value: "Good" },
    { label: "Item accuracy", value: "Good" },
    { label: "Communication", value: "Excellent" },
    { label: "Order handling", value: "Good" },
  ],
};

/** Photo slots for a listing that states none. Frames, not real photographs. */
const DEFAULT_IMAGE_LABELS = ["Front", "Side", "In use", "Box contents"];

export const productExtras: Record<string, ProductExtras> = {
  // ---------------------------------------------------------------- Computers
  "hp-pavilion-15-laptop": {
    sku: "OCN-HP-PAV15-I516",
    imageLabels: ["Front", "Lid closed", "Keyboard", "Ports", "In use", "Box contents"],
    paragraphs: [
      "The **HP Pavilion 15** is the everyday machine in the range: a **15.6-inch Full HD** screen, an **Intel Core i5** processor and enough memory to keep a term's worth of browser tabs, Office documents and a call open at the same time.",
      "What decides how it feels in daily use is the **16GB of RAM** paired with a **512GB SSD**. The solid-state drive is the reason it starts in seconds rather than minutes, and it is quiet enough that a library or a shared office will never hear it working.",
      "The 15.6-inch **Full HD** panel is sized for split-screen work — a document beside a browser, a spreadsheet beside a reference. It is the same size class that most schools and offices standardise on, so a file laid out here looks the same laid out there.",
      "This is a **work, school and light creative** machine. It will handle documents, spreadsheets, video calls, photo editing and a decade of coursework without complaint. It is not a gaming laptop and is not sold as one; heavy 3D rendering and modern AAA games are outside what this configuration is built for.",
      "Every Pavilion sold by OCNOO is **new**, comes with the manufacturer's standard adapter, and is checked and powered on before it is packed. If you want the exact processor generation confirmed for the unit that would ship to you, message us on WhatsApp before ordering — we would rather answer the question than have you guess.",
    ],
    keyFeatures: [
      {
        title: "Intel Core i5 processor",
        body: "The mid-range chip in the Pavilion line: fast enough for office work, streaming, multitasking and student workloads, without the price of the i7 configuration.",
      },
      {
        title: "16GB RAM",
        body: "Double the 8GB baseline most budget laptops still ship with, which is what actually keeps a browser with twenty tabs from slowing the machine down.",
      },
      {
        title: "512GB SSD storage",
        body: "Solid-state, so booting and file copies are quick and the machine has no spinning drive to fail if it is carried to class every day.",
      },
      {
        title: "15.6-inch Full HD display",
        body: "The standard productivity size. Comfortable for split-screen work and easy to read across a full day.",
      },
      {
        title: "Checked before dispatch",
        body: "Powered on, screen and keyboard tested, and the battery state reported to you before the box leaves OCNOO.",
      },
    ],
    inTheBox: [
      "HP Pavilion 15 laptop*1",
      "Original charger and power cable*1",
      "Documentation and setup guide*1",
    ],
    specifications: [
      { label: "Processor", value: "Intel Core i5" },
      { label: "Memory", value: "16GB RAM" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Display", value: '15.6" FHD' },
      { label: "Graphics", value: "Integrated Intel graphics" },
      { label: "Condition", value: "New" },
      { label: "Warranty", value: "Manufacturer's standard warranty" },
    ],
    coupons: [{ label: "LAPTOP5", off: "₦5,000 off at checkout" }],
    promotions: [
      "Call or chat with OCNOO on WhatsApp to place an order and pay on delivery within Lagos.",
      "Ask about a trade-in credit if you have a working laptop to hand in.",
    ],
  },

  // ------------------------------------------------------------------- Phones
  "samsung-galaxy-a54": {
    sku: "OCN-SAM-A54-128",
    imageLabels: ["Front", "Back", "Camera close-up", "In hand", "Box contents"],
    paragraphs: [
      "The **Samsung Galaxy A54** is the mid-range Galaxy that most people actually need: a **50MP triple camera**, a **Super AMOLED** display and a battery built to last a full working day.",
      "The screen is the part you touch most, and this one is **Super AMOLED** — the deep blacks and bright colours that make photos, maps and video look better than they would on the LCD panel of a similarly priced phone.",
      "The **50MP main camera** is the same headline number Samsung puts on this model, backed by an ultra-wide and a macro lens. Daylight shots are the strong point; night mode is there for the rest.",
      "**128GB of storage** holds a large photo library and a few heavy games without needing to manage space, and **5G** means the phone will not be left behind by the networks being built out now.",
      "Sold **new** and sealed. OCNOO checks the box contents and the IMEI against the paperwork before dispatch, and can walk you through the setup on WhatsApp after it arrives.",
    ],
    keyFeatures: [
      {
        title: "50MP triple camera",
        body: "Main, ultra-wide and macro. Handles everyday photography — people, documents, receipts, scenery — in one lens switch.",
      },
      {
        title: "Super AMOLED display",
        body: "The panel type Samsung is known for. Bright outdoors, deep blacks, easy on the eyes for reading.",
      },
      {
        title: "128GB storage",
        body: "Room for a full photo library, messaging history and several large apps without constant clearing.",
      },
      {
        title: "5G ready",
        body: "Works on the current 4G networks and on 5G where coverage has reached.",
      },
      {
        title: "All-day battery",
        body: "A full day of normal use — calls, WhatsApp, browsing and video — on a single charge.",
      },
    ],
    inTheBox: [
      "Samsung Galaxy A54 handset*1",
      "USB-C charging cable*1",
      "SIM ejector tool and documentation*1",
    ],
    specifications: [
      { label: "Storage", value: "128GB" },
      { label: "Network", value: "5G" },
      { label: "Camera", value: "50MP triple" },
      { label: "Display", value: "Super AMOLED" },
      { label: "Battery", value: "5,000mAh" },
      { label: "Condition", value: "New, sealed" },
    ],
    promotions: [
      "Chat with OCNOO on WhatsApp before ordering to confirm the colour in stock.",
    ],
  },

  // ----------------------------------------------------------- Power & cable
  "anker-20000mah-power-bank": {
    sku: "OCN-AKR-A1366",
    imageLabels: ["Front", "Ports", "Cable connected", "In a bag", "Box contents"],
    paragraphs: [
      "The **Anker 20,000mAh power bank** is the capacity that gets you through an outage or a travel day without hunting for a socket. At that figure it will take an ordinary phone from empty to full roughly **four times**.",
      "What makes it usable rather than just large is **dual USB output with PowerIQ**, Anker's charging negotiation. Plug a phone into one side and a tablet or speaker into the other and both charge at their own fastest safe rate, at the same time.",
      "The block is sized for a backpack side pocket rather than a trouser pocket — that is the honest trade for 20,000mAh. If you want something for a jacket pocket, this is not it; ask OCNOO about the smaller models instead.",
      "It holds its charge well when idle, which is the property that matters for the one time a year you actually need it. Drain it fully once a month to keep the cells honest, and store it out of direct sun.",
      "Sold **new**. OCNOO tests the output on both ports before the unit is packed, and will tell you the charge state it ships at.",
    ],
    keyFeatures: [
      {
        title: "20,000mAh capacity",
        body: "About four full phone charges from one recharge — a weekend away or one long outage without a generator.",
      },
      {
        title: "Dual USB output",
        body: "Two devices on the go at once, so a phone and a tablet charge from the same block.",
      },
      {
        title: "PowerIQ fast charge",
        body: "Reads what the connected device accepts and supplies that rate instead of a slow default.",
      },
      {
        title: "High-capacity, travel-friendly form",
        body: "A backpack block rather than a pocket one — the size is the trade for the capacity.",
      },
    ],
    inTheBox: [
      "Anker 20,000mAh power bank*1",
      "USB charging cable*1",
      "User guide and warranty card*1",
    ],
    specifications: [
      { label: "Capacity", value: "20,000mAh" },
      { label: "Outputs", value: "Dual USB" },
      { label: "Charging", value: "PowerIQ fast charge" },
      { label: "Input", value: "USB-C / micro-USB recharge" },
      { label: "Condition", value: "New" },
    ],
    coupons: [{ label: "POWER10", off: "₦2,000 off two units" }],
    promotions: [
      "Buy two and keep one at home, one in the car — ask OCNOO about the pair price.",
    ],
  },

  // ---------------------------------------------------------------- Kitchen
  "nexus-electric-kettle": {
    sku: "OCN-NXK-15L-SS",
    imageLabels: ["Front", "Lid open", "Base and cord", "Poured", "Box contents"],
    paragraphs: [
      "The **Nexus 1.5L electric kettle** does one job and does it quickly: **boils water in minutes** for tea, pap, noodles and cooking, without waiting on a stove or a gas refill.",
      "The **stainless-steel body** is the part worth paying attention to. It does not crack the way a glass kettle does, it does not pass a plastic taste into the first cup of the morning, and limescale stays visible so you know when it is time to descale.",
      "Two safety behaviours are built in and both matter in a house with children or a generator-changeover: **automatic shut-off** the moment the water reaches a boil, and **boil-dry protection** that cuts power if the kettle is switched on while empty.",
      "**1.5 litres** is the practical family size — enough for a pot of tea and a bowl of pap in one boil, small enough that the kettle is not half-full of stale water sitting on the counter.",
      "Sold **new**, with the base and cord checked before packing. OCNOO will confirm the voltage plate matches your supply before it ships.",
    ],
    keyFeatures: [
      {
        title: "1.5 litre capacity",
        body: "The family middle ground: several cups per boil without a large volume of water sitting unused.",
      },
      {
        title: "Stainless-steel body",
        body: "Durable, no plastic taste, and limescale is visible so cleaning is not guesswork.",
      },
      {
        title: "Automatic shut-off",
        body: "Switches itself off at boil, so a forgotten kettle is not a burned-out element.",
      },
      {
        title: "Boil-dry protection",
        body: "Refuses to run hot when there is no water in it — the failure that kills most kettles.",
      },
      {
        title: "Cordless pouring",
        body: "The jug lifts off its base, so you can carry it to the table and pour without the cord in the way.",
      },
    ],
    inTheBox: [
      "Nexus kettle jug*1",
      "Power base with cord*1",
      "Instruction leaflet*1",
    ],
    specifications: [
      { label: "Capacity", value: "1.5L" },
      { label: "Body", value: "Stainless steel" },
      { label: "Safety", value: "Auto shut-off, boil-dry" },
      { label: "Base", value: "360° cordless pouring" },
      { label: "Condition", value: "New" },
    ],
  },

  "scanfrost-blender-2l": {
    sku: "OCN-SCF-BL2L",
    imageLabels: [
      "Front",
      "Jug and blades",
      "Dry mill attachment",
      "In use",
      "Controls",
      "Box contents",
    ],
    paragraphs: [
      "The **Scanfrost 2L blender** is built for the way Nigerian kitchens actually use a blender — **peppers, tomatoes and onions** for stew in bulk, **pap and beans**, and dry grinding for spices. This is the heavy-duty class of machine, not a milkshake stick blender.",
      "Capacity is the first thing to notice. The **2-litre jar** takes a full batch of stew ingredients in one go, which is the difference between blending twice on a Saturday morning and blending once. A smaller jar means more washing and more waiting.",
      "The **stainless-steel blade set** is what makes the tough jobs possible. Blunt or thin blades stall on ice and fibrous pepper skins; this set is the reason the machine is described as heavy-duty rather than decorative.",
      "**Multiple speeds** plus a pulse give you control over the texture you end up with — a coarse crush for beans, a smooth purée for stew bases, and a short pulse for anything you do not want turned to water.",
      "The motor is the part that decides how long the machine lasts, and it is also the part most abused. Run it in short bursts on heavy loads rather than holding the switch down, and rinse the jug immediately after use. Sold **new**, with the jar, lid and blade assembly checked for chips and seats before it is packed.",
    ],
    keyFeatures: [
      {
        title: "2 litre jar",
        body: "Full-batch capacity for stew ingredients, pap and soups — fewer runs, less washing.",
      },
      {
        title: "Stainless steel blades",
        body: "The cutting set that handles ice, pepper skins, tomatoes and cooked beans without stalling.",
      },
      {
        title: "Multiple speeds with pulse",
        body: "Coarse crush through smooth purée from the same machine, controlled by you.",
      },
      {
        title: "Heavy-duty build",
        body: "A base sized for the work, not a countertop accessory that gives up on the second batch.",
      },
      {
        title: "Easy to clean",
        body: "The jug lifts off the base and the blade assembly rinses clean with warm water and a drop of soap.",
      },
    ],
    inTheBox: [
      "Blender base unit*1",
      "2L blending jar*1",
      "Jar lid with measuring cap*1",
      "Stainless blade assembly*1",
      "Instruction leaflet*1",
    ],
    specifications: [
      { label: "Capacity", value: "2L" },
      { label: "Blades", value: "Stainless steel" },
      { label: "Speeds", value: "Multiple with pulse" },
      { label: "Jar material", value: "Thickened food-grade" },
      { label: "Power", value: "Mains, 220–240V" },
      { label: "Condition", value: "New" },
    ],
    coupons: [{ label: "KITCHEN1500", off: "₦1,500 off this week" }],
    promotions: [
      "Ask OCNOO about the dry-mill attachment for grinding beans, spices and egusi.",
      "Cheaper delivery when you collect from a pickup point instead of home delivery.",
    ],
  },

  "nonstick-cookware-set-7pc": {
    sku: "OCN-CWK-7PC",
    imageLabels: ["Full set", "Single pot", "Lid", "Handle detail", "Box contents"],
    paragraphs: [
      "The **seven-piece non-stick set** covers the everyday cooking rotation in one purchase: saucepans for stew and soup, a frying pan for eggs and protein, and matching lids so every pot has one that fits.",
      "The **non-stick coating** is the reason to buy it over bare aluminium. Less oil for the same result, food that releases instead of sticking to the base, and a pan that rinses clean in seconds rather than needing to be scrubbed.",
      "**Heat-resistant handles** stay cool enough to hold on a long simmer, which is the difference between a comfortable cook and a drawer full of folded cloths. They are also the part that most often fails on cheap sets, so they are the piece OCNOO checks first.",
      "The bases are made for **even heating** — hot spots are what scorch a stew at the bottom while the top is still cold, and they are what warp a thin pan over a strong gas flame.",
      "Two honest cautions, because they apply to every non-stick surface and not just this one: use wooden or silicone utensils, not steel, and do not take a hot pan straight under cold water. Treated that way the coating lasts for years; ignored, it will not. Sold **new**.",
    ],
    keyFeatures: [
      {
        title: "Seven pieces",
        body: "Saucepans, a frying pan and matching lids — the everyday rotation without buying separately.",
      },
      {
        title: "Non-stick coating",
        body: "Food releases, less oil is needed, and washing up is a rinse rather than a scrub.",
      },
      {
        title: "Heat-resistant handles",
        body: "Comfortable to hold on a long simmer, and firm enough not to work loose.",
      },
      {
        title: "Even heating bases",
        body: "Less scorching at the bottom of a stew and less warping over a strong flame.",
      },
    ],
    inTheBox: [
      "Saucepan with lid*2",
      "Casserole pot with lid*1",
      "Frying pan*1",
      "Loose lids*2",
    ],
    specifications: [
      { label: "Pieces", value: "7" },
      { label: "Coating", value: "Non-stick" },
      { label: "Handles", value: "Heat-resistant" },
      { label: "Suitable for", value: "Gas and electric hobs" },
      { label: "Condition", value: "New" },
    ],
    promotions: [
      "Ask OCNOO whether a replacement lid is available before you order a size.",
    ],
  },
};

/**
 * The second tier: a complete record assembled from what the listing already
 * states. Nothing here is invented — every fact traces back to a field on
 * `Product`, and the sentences that are not a fact are explicitly about the
 * listing itself or about asking OCNOO.
 */
function buildFallback(product: Product, categoryName: string): ProductExtras {
  const specLine = (product.specs ?? [])
    .map((s) => `**${s.label}** — ${s.value}`)
    .join("; ");

  const paragraphs = [
    product.description,
    specLine
      ? `What this listing states, in plain terms: ${specLine}. Those are the figures OCNOO has on the unit and they are what you are buying against — if you need the exact variant or model number confirmed for the item that would ship to you, message us on WhatsApp before ordering.`
      : `This listing is sold as described above, with no additional specification sheet published yet — message OCNOO on WhatsApp and we will confirm the details before you order.`,
    `Listed as **${product.condition ?? "New"}** under the ${categoryName} range, sold and shipped directly by OCNOO. Every unit is inspected before it is packed, and anything we would want a buyer to know about it is disclosed here rather than left for you to discover.`,
    `Delivery, payment on delivery and what is in the box are all worth a message before you order. The WhatsApp button on this page reaches OCNOO directly, and we would rather answer the question than have you buy the wrong thing.`,
  ].filter(Boolean);

  // Title-only bullets. The first draft generated a sentence per spec, which
  // put the same "this listing states X / ask on WhatsApp" phrasing on the page
  // four or five times over — louder than the facts it was wrapping. The caveat
  // now appears once, in paragraph two, and a generated listing reads as a
  // short spec list rather than a paragraph that repeats itself.
  const keyFeatures = (product.specs ?? []).map((s) => ({
    title: `${s.label}: ${s.value}`,
    body: "",
  }));

  return {
    sku: `OCN-${product.id.toUpperCase()}`,
    paragraphs,
    keyFeatures,
    inTheBox: [
      `${product.name}*1`,
      "Cables, accessories and documentation as supplied by the manufacturer",
    ],
    specifications: [
      ...(product.specs ?? []),
      { label: "Brand", value: product.brand ?? categoryName },
      { label: "Condition", value: product.condition ?? "New" },
    ],
  };
}

/**
 * Everything the deep-dive panels need, for any product. Hand-written record
 * when one exists, generated restatement when it does not.
 */
export function getProductExtras(product: Product): ResolvedExtras {
  const categoryName =
    getCategoryBySlug(product.category)?.name ?? "the OCNOO catalogue";
  const base = productExtras[product.slug] ?? buildFallback(product, categoryName);

  return {
    ...base,
    imageLabels: base.imageLabels ?? DEFAULT_IMAGE_LABELS,
    seller: base.seller ?? OCNOO_STORE,
  };
}
