"use client";

import { useState } from "react";
import type { Product } from "@/types";
import { getCategoryBySlug } from "@/data/categories";
import { getProductExtras } from "@/data/productExtras";
import { useCart } from "@/context/CartContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PriceTag from "@/components/ui/PriceTag";
import Rating from "@/components/ui/Rating";
import SaveButton from "@/components/ui/SaveButton";
import ProductGallery from "@/components/product/ProductGallery";
import { ChevronRightIcon } from "@/components/ui/icons";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25";

/**
 * What a card tap opens on a phone.
 *
 * The sheet used to render the whole ProductDetail, which made sense while that
 * was four fields. With the deep dive, the seller block and the section tabs it
 * is nine blocks inside a 90vh scroller with a grab handle at the top — the
 * sheet's job is fast browse-and-dismiss, so it now carries only what decides
 * "is this the one" and hands everything else to the full page.
 */
export default function ProductSheetSummary({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const extras = getProductExtras(product);
  const categoryName = getCategoryBySlug(product.category)?.name;

  const metaLine = [product.brand, categoryName, product.condition]
    .filter(Boolean)
    .join(" • ");

  function handleAdd() {
    addItem(product.id, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-1">
      <ProductGallery product={product} labels={extras.imageLabels} />

      {/* The save disc the gallery used to carry. It moved to the buy box on the
          full page, and this sheet renders neither — so without it there was no
          way to save an item from a card tap on a phone at all. */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {product.badge && <Badge>{product.badge}</Badge>}
        </div>
        <SaveButton
          productId={product.id}
          productName={product.name}
          variant="disc"
          className="-mr-2 -mt-1 shrink-0"
        />
      </div>

      <h2 className="font-sans text-xl font-bold leading-snug">{product.name}</h2>

      {metaLine && (
        <p className="font-sans text-sm text-black/55">{metaLine}</p>
      )}

      {product.rating !== undefined && (
        <Rating value={product.rating} count={product.reviewCount} size={16} />
      )}

      <PriceTag
        price={product.price}
        oldPrice={product.oldPrice}
        tone="shell"
        size="lg"
      />

      <p className="font-sans text-sm font-bold uppercase tracking-wide text-black">
        {!product.inStock
          ? "Currently unavailable"
          : product.stockQty && product.stockQty <= 5
          ? `Only ${product.stockQty} left`
          : "In stock"}
      </p>

      {/* Pinned to the bottom of the sheet's own scroller. Without this the two
          actions sat at the END of an 855px sheet inside a 90vh window, so on a
          390x844 phone "See full details" was below the fold and Add to Cart sat
          right at the edge — the one thing you came here to do needed a scroll
          to find. */}
      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-line bg-white px-4 pb-3 pt-3">
        <Button
          variant="primary"
          disabled={!product.inStock}
          onClick={handleAdd}
          className="w-full"
        >
          {added ? "Added \u2713" : "Add to Cart"}
        </Button>

        {/* A plain <a>, not <Link>. The intercepted tap already pushed this same
            URL, so a client-side navigation to it is a no-op and the sheet stays
            open — the exact trap ProductSheet documents for desktop. A real
            anchor forces the document navigation that renders the full page. */}
        <a
          href={`/product/${product.slug}`}
          className={`flex min-h-[44px] items-center justify-between gap-2 rounded-lg border border-line bg-white px-3 font-sans text-sm font-bold uppercase tracking-wide ${FOCUS_RING}`}
        >
          See full details
          <ChevronRightIcon size={16} />
        </a>
      </div>
    </div>
  );
}
