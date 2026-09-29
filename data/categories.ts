import type { Category } from "@/types";

export const categories: Category[] = [
  { id: "c1", name: "Computers & Phones", slug: "computers-phones" },
  {
    id: "c2",
    name: "Electronics & Power Accessories",
    slug: "electronics-power-accessories",
  },
  { id: "c3", name: "Home & Kitchen", slug: "home-kitchen" },
  {
    id: "c4",
    name: "Office & School Supplies",
    slug: "office-school-supplies",
  },
  { id: "c5", name: "Fashion & Accessories", slug: "fashion-accessories" },
  {
    id: "c6",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
  },
  { id: "c7", name: "Household Products", slug: "household-products" },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
