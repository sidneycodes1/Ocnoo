"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { getProductExtras } from "@/data/productExtras";
import { BUSINESS } from "@/lib/business";
import { useCart } from "@/context/CartContext";
import Button from "@/components/ui/Button";
import MobileStickyBar from "@/components/layout/MobileStickyBar";
import ProductBuyBox from "@/components/product/ProductBuyBox";
import ProductDeepDive from "@/components/product/ProductDeepDive";
import ProductGallery from "@/components/product/ProductGallery";
import ProductShareRow from "@/components/product/ProductShareRow";
import SellerCard from "@/components/product/SellerCard";
import SectionTabs from "@/components/product/SectionTabs";
import StickyMiniCard from "@/components/product/StickyMiniCard";
import { DocIcon, ListIcon, MessagesIcon } from "@/components/ui/icons";

/**
 * Module-level so the reference is stable across renders. SectionTabs keys its
 * scroll-spy effect on this array; rebuilding it on every qty change would tear
 * down and re-add the scroll listeners for no reason.
 *
 * The ids must match the anchors rendered by ProductDeepDive.
 */
const SECTION_TABS = [
  { id: "product-details", label: "Product details", icon: <DocIcon size={18} /> },
  { id: "specifications", label: "Specifications", icon: <ListIcon size={18} /> },
];

/**
 * The product page.
 *
 * Three columns from `lg` up — gallery, buy box, right rail — with the deep
 * dive in row two, spanning the first two columns. The rail is deliberately
 * placed in BOTH rows (`lg:row-span-2`) rather than dropped below the fold: a
 * sticky element only stays pinned while its containing block is on screen, so
 * a rail that lived next to the buy box alone would unpin exactly at the moment
 * the section tabs become useful.
 *
 * Below `lg` the explicit placements fall away and DOM order is the reading
 * order: gallery, buy box, seller + tabs, deep dive.
 */
export default function ProductDetail({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();
  const ctaRef = useRef<HTMLDivElement>(null);

  const extras = getProductExtras(product);

  const handleAdd = () => {
    addItem(product.id, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product.id, qty);
    router.push("/checkout");
  };

  const askHref = `https://wa.me/${BUSINESS.phoneDial}?text=${encodeURIComponent(
    `Question about "${product.name}" on OCNOO`
  )}`;

  return (
    <div className="mx-auto max-w-7xl animate-fade-in px-4 py-4 md:px-4 md:py-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,36%)_minmax(0,1fr)_19rem] lg:gap-8">
        {/* ---- Column 1: imagery ---- */}
        <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-1">
          <ProductGallery product={product} labels={extras.imageLabels} />
          <ProductShareRow product={product} />
        </div>

        {/* ---- Column 2: the decision ---- */}
        <div className="lg:col-start-2 lg:row-start-1">
          <ProductBuyBox
            product={product}
            extras={extras}
            qty={qty}
            onQtyChange={setQty}
            onAdd={handleAdd}
            added={added}
            ctaRef={ctaRef}
          />
        </div>

        {/* ---- Column 3: seller, sections, persistent purchase ---- */}
        <aside
          aria-label="Seller and listing sections"
          className="flex flex-col gap-4 lg:col-start-3 lg:row-span-2 lg:row-start-1"
        >
          <SellerCard seller={extras.seller} />

          <div className="pdp-rail flex flex-col gap-4">
            <SectionTabs items={SECTION_TABS} />
            <StickyMiniCard
              product={product}
              anchorRef={ctaRef}
              added={added}
              onAdd={handleAdd}
            />

            <div className="rounded-xl border border-line bg-surface/60 p-4 text-center">
              <p className="font-sans text-sm font-bold">
                Questions about this product?
              </p>
              <Button
                href={askHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                labelCase="none"
                className="mt-3 w-full gap-2"
              >
                <MessagesIcon size={18} />
                Chat to OCNOO
              </Button>
            </div>
          </div>
        </aside>

        {/* ---- Row 2: the long content, under the two upper columns ---- */}
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2">
          <ProductDeepDive extras={extras} />
        </div>
      </div>

      <MobileStickyBar
        onAddToCart={handleAdd}
        onBuyNow={handleBuyNow}
        added={added}
        disabled={!product.inStock}
      />

      {/* Spacer so the fixed mobile bar never overlaps the footer/content */}
      <div className="h-20 md:hidden" aria-hidden="true" />
    </div>
  );
}
