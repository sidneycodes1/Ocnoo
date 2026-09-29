"use client";

import { useState } from "react";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import ProductGrid from "@/components/product/ProductGrid";
import Button from "@/components/ui/Button";

export default function ShopBrowser({
  initialCategory = "all",
}: {
  initialCategory?: string;
}) {
  const [selected, setSelected] = useState(initialCategory);

  const visible =
    selected === "all"
      ? products
      : products.filter((p) => p.category === selected);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={selected === "all" ? "primary" : "secondary"}
          onClick={() => setSelected("all")}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selected === cat.slug ? "primary" : "secondary"}
            onClick={() => setSelected(cat.slug)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <ProductGrid products={visible} />
    </div>
  );
}
