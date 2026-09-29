import type { Product } from "@/types";

// Demo-only "backend": all product data lives here as typed static files.
// Image paths are placeholders — real photos get added later.
export const products: Product[] = [
  // Computers & Phones
  {
    id: "p01",
    slug: "hp-pavilion-15-laptop",
    name: "HP Pavilion 15 Laptop",
    price: 720000,
    category: "computers-phones",
    images: ["/images/placeholder-1.jpg"],
    description:
      "15.6\" FHD laptop with an Intel Core i5 processor, 16GB RAM and a 512GB SSD. Built for work, school and light creative tasks.",
    badge: "New",
    inStock: true,
  },
  {
    id: "p02",
    slug: "samsung-galaxy-a54",
    name: "Samsung Galaxy A54",
    price: 320000,
    category: "computers-phones",
    images: ["/images/placeholder-2.jpg"],
    description:
      "128GB 5G smartphone with a 50MP triple camera, Super AMOLED display and all-day battery.",
    inStock: true,
  },
  {
    id: "p03",
    slug: "lenovo-thinkpad-x1",
    name: "Lenovo ThinkPad X1 Carbon",
    price: 950000,
    category: "computers-phones",
    images: ["/images/placeholder-3.jpg"],
    description:
      "Ultra-light business laptop with an Intel Core i7, 16GB RAM, 1TB SSD and legendary keyboard comfort.",
    badge: "Deal",
    inStock: true,
  },

  // Electronics & Power Accessories
  {
    id: "p04",
    slug: "anker-20000mah-power-bank",
    name: "Anker 20,000mAh Power Bank",
    price: 45000,
    category: "electronics-power-accessories",
    images: ["/images/placeholder-4.jpg"],
    description:
      "Fast-charge power bank with dual USB output and PowerIQ. Charges a phone up to four times on one full charge.",
    badge: "Deal",
    inStock: true,
  },
  {
    id: "p05",
    slug: "orico-usb-c-hub",
    name: "ORICO 7-in-1 USB-C Hub",
    price: 28000,
    category: "electronics-power-accessories",
    images: ["/images/placeholder-5.jpg"],
    description:
      "Expand one USB-C port into HDMI, three USB 3.0 ports, SD/TF card readers and 100W pass-through charging.",
    inStock: true,
  },
  {
    id: "p06",
    slug: "philips-rechargeable-fan",
    name: "Philips Rechargeable Standing Fan",
    price: 35000,
    category: "electronics-power-accessories",
    images: ["/images/placeholder-6.jpg"],
    description:
      "Cordless standing fan with a built-in battery that runs for hours during power outages. Three speed settings.",
    inStock: true,
  },

  // Home & Kitchen
  {
    id: "p07",
    slug: "nexus-electric-kettle",
    name: "Nexus 1.5L Electric Kettle",
    price: 18000,
    category: "home-kitchen",
    images: ["/images/placeholder-7.jpg"],
    description:
      "Stainless-steel 1.5L kettle with auto shut-off and boil-dry protection. Boils water in minutes.",
    inStock: true,
  },
  {
    id: "p08",
    slug: "scanfrost-blender-2l",
    name: "Scanfrost 2L Blender",
    price: 65000,
    category: "home-kitchen",
    images: ["/images/placeholder-8.jpg"],
    description:
      "Heavy-duty 2L blender with stainless blades and multiple speeds. Perfect for smoothies, peppers and pap.",
    badge: "New",
    inStock: true,
  },
  {
    id: "p09",
    slug: "nonstick-cookware-set-7pc",
    name: "Non-Stick Cookware Set (7pc)",
    price: 85000,
    category: "home-kitchen",
    images: ["/images/placeholder-9.jpg"],
    description:
      "Seven-piece non-stick pot and pan set with heat-resistant handles. Even heating and easy cleaning.",
    inStock: true,
  },

  // Office & School Supplies
  {
    id: "p10",
    slug: "exposition-paper-200-leaves",
    name: "Exposition Paper (200 Leaves)",
    price: 3500,
    category: "office-school-supplies",
    images: ["/images/placeholder-10.jpg"],
    description:
      "Pack of 200 ruled foolscap exposition sheets, ideal for school and office note-taking.",
    inStock: true,
  },
  {
    id: "p11",
    slug: "hp-deskjet-2700-printer",
    name: "HP DeskJet 2700 Printer",
    price: 145000,
    category: "office-school-supplies",
    images: ["/images/placeholder-11.jpg"],
    description:
      "Compact all-in-one inkjet printer for print, scan and copy. Works over Wi-Fi from phone or laptop.",
    inStock: true,
  },

  // Fashion & Accessories
  {
    id: "p12",
    slug: "mens-leather-waist-belt",
    name: "Men's Leather Waist Belt",
    price: 12000,
    category: "fashion-accessories",
    images: ["/images/placeholder-12.jpg"],
    description:
      "Genuine-leather belt with a brushed-metal buckle. A durable everyday staple for casual and formal wear.",
    inStock: true,
  },
  {
    id: "p13",
    slug: "ankara-tote-bag",
    name: "Anka Print Tote Bag",
    price: 22000,
    category: "fashion-accessories",
    images: ["/images/placeholder-13.jpg"],
    description:
      "Handmade Ankara-print tote with a roomy interior and reinforced straps. Bold, everyday African style.",
    badge: "New",
    inStock: true,
  },
  {
    id: "p14",
    slug: "polarized-sunglasses",
    name: "Polarized Sunglasses",
    price: 15000,
    category: "fashion-accessories",
    images: ["/images/placeholder-14.jpg"],
    description:
      "UV400 polarized lenses in a lightweight frame. Cuts glare for driving and bright sunny days.",
    inStock: true,
  },

  // Beauty & Personal Care
  {
    id: "p15",
    slug: "shea-butter-body-lotion",
    name: "Shea Butter Body Lotion",
    price: 8500,
    category: "beauty-personal-care",
    images: ["/images/placeholder-15.jpg"],
    description:
      "Rich, fast-absorbing lotion with pure shea butter for deep, all-day moisture. Unscented formula.",
    inStock: true,
  },
  {
    id: "p16",
    slug: "hair-straightener-brush",
    name: "Ionic Hair Straightener Brush",
    price: 27000,
    category: "beauty-personal-care",
    images: ["/images/placeholder-16.jpg"],
    description:
      "Ceramic ionic straightening brush that smooths and shines in one pass. Five heat settings for every hair type.",
    badge: "Pre-Order",
    inStock: false,
  },
  {
    id: "p17",
    slug: "mens-grooming-kit",
    name: "Men's Grooming Kit",
    price: 19500,
    category: "beauty-personal-care",
    images: ["/images/placeholder-17.jpg"],
    description:
      "Rechargeable beard trimmer and grooming set with multiple guards, scissors and a travel case.",
    inStock: true,
  },

  // Household Products
  {
    id: "p18",
    slug: "dettol-cleaning-kit",
    name: "Dettol Cleaning Kit",
    price: 9000,
    category: "household-products",
    images: ["/images/placeholder-18.jpg"],
    description:
      "Everything you need for a deep clean: antiseptic fluid, wipes and a spray bottle in one bundle.",
    inStock: true,
  },
  {
    id: "p19",
    slug: "led-emergency-bulb-2pack",
    name: "LED Emergency Bulb (2-Pack)",
    price: 11000,
    category: "household-products",
    images: ["/images/placeholder-19.jpg"],
    description:
      "Rechargeable LED bulbs that stay on during power cuts. Charges while the lights are on, glows when they are out.",
    inStock: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.category === categorySlug);
}
