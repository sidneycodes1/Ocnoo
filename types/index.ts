export type Condition = "New" | "Used" | "Unopened";

/** One row of the product "About this product" spec table. */
export interface Spec {
  label: string;
  value: string;
}

/** One bullet of the deep-dive "Key features" panel: a bold lead plus body. */
export interface FeatureBullet {
  title: string;
  body: string;
}

/** A discount voucher offered on the listing. Demo copy, not a live code. */
export interface Coupon {
  label: string;
  off: string;
}

export type PerformanceWord = "Excellent" | "Good" | "Average" | "Fair";

/** The seller block. Values are DEMO figures, not measured store data. */
export interface SellerInfo {
  name: string;
  /** Short line under the name, e.g. "Sold and shipped by OCNOO". */
  tagline: string;
  scorePct: number;
  followers: number;
  performance: { label: string; value: PerformanceWord }[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number; // in Naira, whole number
  category: string; // matches Category.slug
  /** Bucket object paths ("photos/abc.jpg") or legacy "/images/…" paths. */
  images: string[];
  description: string;
  badge?: "New" | "Deal" | "Pre-Order";
  inStock: boolean;

  // ---- Added for the mobile app shell -------------------------------------
  // All optional so existing call sites keep rendering if a row is not
  // filled in yet. `oldPrice` powers the struck-through compare-at price,
  // `rating`/`reviewCount` the amber star row, `specs` the spec table.
  oldPrice?: number;
  brand?: string;
  condition?: Condition;
  rating?: number; // 0–5
  reviewCount?: number;
  specs?: Spec[];
  stockQty?: number;
  /** ISO timestamp from the shared catalogue; powers the "Just In" ordering. */
  publishedAt?: string;
}

/**
 * The long-form content a product page shows below the buy box: prose detail,
 * key features, box contents, the full spec table, and the seller block.
 *
 * This is deliberately SEPARATE from `Product`. `Product` is what a card, a
 * cart row and an order line all need; nothing there should grow because the
 * detail page wanted another panel. Everything here is prototype copy.
 */
export interface ProductExtras {
  sku: string;
  /** Long-form paragraphs. `**strong**` marks the bolded key phrases. */
  paragraphs: string[];
  keyFeatures: FeatureBullet[];
  inTheBox: string[];
  specifications: Spec[];
  coupons?: Coupon[];
  promotions?: string[];
  /** One label per photo slot in the gallery. */
  imageLabels?: string[];
  /** Absent means "the OCNOO store block" — see data/productExtras.ts. */
  seller?: SellerInfo;
}

/** `ProductExtras` after resolution, so a call site never re-defaults. */
export interface ResolvedExtras extends Omit<ProductExtras, "seller"> {
  seller: SellerInfo;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  /** Key resolved by <CategoryIcon />. */
  icon?: string;
}

/** A brand derived from the product list; powers the circular brand tiles. */
export interface Brand {
  name: string;
  slug: string;
  productCount: number;
}
