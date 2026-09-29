import type { Metadata } from "next";
import ShopBrowser from "@/components/product/ShopBrowser";

export const metadata: Metadata = {
  title: "Shop — OCNOO Online Store",
};

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-sans text-3xl font-extrabold uppercase tracking-tight">
        Shop All Products
      </h1>
      <ShopBrowser initialCategory="all" />
    </div>
  );
}
