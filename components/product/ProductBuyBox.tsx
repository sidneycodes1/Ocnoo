"use client";

import type { Ref } from "react";
import Link from "next/link";
import type { Product, ResolvedExtras } from "@/types";
import { getCategoryBySlug } from "@/data/categories";
import { getBrandBySlug } from "@/lib/brands";
import { useCatalog } from "@/context/CatalogProvider";
import { brandSlug } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PriceTag from "@/components/ui/PriceTag";
import Rating from "@/components/ui/Rating";
import SaveButton from "@/components/ui/SaveButton";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { CartIcon, StarIcon, TagIcon } from "@/components/ui/icons";

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/25";

interface ProductBuyBoxProps {
  product: Product;
  extras: ResolvedExtras;
  qty: number;
  onQtyChange: (qty: number) => void;
  onAdd: () => void;
  added: boolean;
  /**
   * Attached to the desktop action row. The sticky mini-card in the right rail
   * watches this element and only appears once it has scrolled away, so the
   * page never offers two live "add to cart" buttons at once.
   */
  ctaRef?: Ref<HTMLDivElement>;
}

/**
 * The centre column: everything needed to decide, and nothing that belongs to
 * the description.
 *
 * It used to be a `md:hidden`-riddled block — brand, condition, rating and the
 * spec table were all in the data and all suppressed on desktop, which is why
 * the desktop page read as thin next to a real listing. Every field now renders
 * at every width. The description paragraph is the one thing that left: it is
 * the first paragraph of the Product details section below, and repeating it
 * here just pushed the buy actions down the screen.
 */
export default function ProductBuyBox({
  product,
  extras,
  qty,
  onQtyChange,
  onAdd,
  added,
  ctaRef,
}: ProductBuyBoxProps) {
  const { products: catalogue } = useCatalog();
  const maxQty = product.stockQty && product.stockQty > 0 ? product.stockQty : 99;
  const categoryName = getCategoryBySlug(product.category)?.name;
  const brand = product.brand;
  // "Similar products from X" only goes somewhere when X has a brand page.
  // `Generic` is excluded from the derived brand list, so linking it would land
  // on an unfiltered /shop and read as a broken link.
  const brandHref = brand && getBrandBySlug(catalogue, brandSlug(brand))
    ? `/shop?brand=${brandSlug(brand)}`
    : null;

  const lowStock = !!product.stockQty && product.stockQty <= 5;
  const stockWord = !product.inStock
    ? "Currently unavailable"
    : lowStock
    ? `Only ${product.stockQty} left`
    : "In stock";

  return (
    <div className="flex flex-col gap-4">
      {/* Promo chip and the save control share the top row so the disc does not
          have to float over the gallery the way it does on mobile. */}
      <div className="flex items-start justify-between gap-3">
        <div>
          {/* The ink Badge, not an amber one: Badge sets `text-white`, and
              appending `text-black` at the call site would LOSE — Tailwind
              resolves by generated order, not class-attribute order, and
              `.text-white` is emitted after `.text-black` in this theme. The
              reference's chip is orange because orange is its brand colour;
              ours is ink for the same reason the card chips are. */}
          {product.badge && <Badge>{product.badge}</Badge>}
        </div>
        <SaveButton
          productId={product.id}
          productName={product.name}
          variant="disc"
          className="-mr-2 -mt-1 shrink-0"
        />
      </div>

      <h1 className="font-sans text-2xl font-bold leading-snug md:text-3xl md:font-extrabold md:uppercase md:leading-tight">
        {product.name}
      </h1>

      {(brand || categoryName) && (
        <p className="font-sans text-sm text-black/60">
          {brand && <>Brand: </>}
          {brand &&
            (brandHref ? (
              <Link
                href={brandHref}
                className={`font-bold text-black underline decoration-line underline-offset-4 hover:decoration-black ${FOCUS_RING}`}
              >
                {brand}
              </Link>
            ) : (
              <span className="font-bold text-black">{brand}</span>
            ))}
          {brandHref && (
            <>
              <span aria-hidden="true"> | </span>
              <Link
                href={brandHref}
                className={`font-bold text-black underline decoration-line underline-offset-4 hover:decoration-black ${FOCUS_RING}`}
              >
                Similar products from {brand}
              </Link>
            </>
          )}
          {!brand && categoryName && (
            <span className="font-bold text-black">{categoryName}</span>
          )}
          {product.condition && (
            <span className="text-black/60"> • Condition: {product.condition}</span>
          )}
        </p>
      )}

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <PriceTag
          price={product.price}
          oldPrice={product.oldPrice}
          tone="shell"
          size="xl"
        />
      </div>

      <p
        className={`font-sans text-sm font-bold uppercase tracking-wide ${
          !product.inStock
            ? "text-black/45"
            : lowStock
            ? "text-accent-ink"
            : "text-black"
        }`}
      >
        {stockWord}
      </p>

      {product.rating !== undefined && (
        <p className="flex items-center gap-2">
          <Rating value={product.rating} count={product.reviewCount} size={18} />
          <span className="font-sans text-xs text-black/55">
            {`${product.reviewCount ?? 0} verified ${
              product.reviewCount === 1 ? "rating" : "ratings"
            }`}
          </span>
        </p>
      )}

      {extras.coupons && extras.coupons.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {extras.coupons.map((coupon) => (
            <li
              key={coupon.label}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent bg-tint-amber px-2.5 py-1.5 font-sans text-xs font-bold uppercase tracking-wide text-accent-ink"
            >
              <TagIcon size={14} />
              {coupon.label}: {coupon.off}
            </li>
          ))}
        </ul>
      )}

      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="font-sans text-sm font-bold uppercase tracking-wide">
          Qty
        </span>
        <div className="inline-flex shrink-0 items-center overflow-hidden border border-line rounded-md">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onQtyChange(Math.max(1, qty - 1))}
            className="h-11 w-11 text-xl font-bold hover:bg-black hover:text-white"
          >
            &minus;
          </button>
          <span className="flex h-11 w-12 items-center justify-center border-x border-line font-mono">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={qty >= maxQty}
            onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
            className="h-11 w-11 text-xl font-bold hover:bg-black hover:text-white disabled:text-black/25 disabled:hover:bg-transparent disabled:hover:text-black/25"
          >
            +
          </button>
        </div>
      </div>

      {/* Desktop / tablet action. Mobile gets the fixed bar instead, so these
          two are never on screen at the same time. */}
      <div ref={ctaRef} className="hidden gap-3 md:flex">
        <Button
          variant="primary"
          disabled={!product.inStock}
          onClick={onAdd}
          className="flex-1 gap-2"
        >
          <CartIcon size={20} />
          {added ? "Added \u2713" : "Add to Cart"}
        </Button>
        <WhatsAppButton label="Chat to Order" />
      </div>

      {extras.promotions && extras.promotions.length > 0 && (
        <section className="border-t border-line pt-4">
          <h2 className="pb-2 font-sans text-sm font-bold uppercase tracking-wide">
            Promotions
          </h2>
          <ul className="flex flex-col gap-2">
            {extras.promotions.map((line) => (
              <li key={line} className="flex items-start gap-2 font-sans text-sm">
                <StarIcon size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
