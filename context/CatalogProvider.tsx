"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Product } from "@/types";

/**
 * The published catalogue, handed from the server render to the client islands
 * that need to resolve an id back into a product: the cart, the saved list and
 * anything else that only stores ids. One copy per page render, no refetch.
 */
interface CatalogValue {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
}

const CatalogContext = createContext<CatalogValue | null>(null);

export function CatalogProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  const value = useMemo<CatalogValue>(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return { products, getProduct: (id: string) => byId.get(id) };
  }, [products]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider");
  return context;
}

/** A product that may have been unpublished since the id was stored. */
export function useCatalogProduct(id: string | undefined): Product | undefined {
  const { getProduct } = useCatalog();
  return id ? getProduct(id) : undefined;
}
