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
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}
