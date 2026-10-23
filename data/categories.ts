import type { Category } from "@/types";

// `icon` is resolved by <CategoryIcon /> in components/ui/icons.tsx.
export const categories: Category[] = [
  {
    id: "c1",
    name: "Computers & Phones",
    slug: "computers-phones",
    icon: "devices",
  },
  {
    id: "c2",
    name: "Electronics & Power Accessories",
    slug: "electronics-power-accessories",
    icon: "bolt",
  },
  {
    id: "c3",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    icon: "kettle",
  },
  {
    id: "c4",
    name: "Office & School Supplies",
    slug: "office-school-supplies",
    icon: "book",
  },
  {
    id: "c5",
    name: "Fashion & Accessories",
    slug: "fashion-accessories",
    icon: "bag",
  },
  {
    id: "c6",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    icon: "droplet",
  },
  {
    id: "c7",
    name: "Household Products",
    slug: "household-products",
    icon: "spray",
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
