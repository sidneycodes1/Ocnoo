export type Condition = "New" | "Used" | "Unopened";

/** One row of the product "About this product" spec table. */
export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number; // in Naira, whole number
  category: string; // matches Category.slug
  images: string[]; // paths under /public/images/
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
