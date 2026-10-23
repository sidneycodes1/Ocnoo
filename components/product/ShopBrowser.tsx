import { products } from "@/data/products";
import { getCategoryBySlug } from "@/data/categories";
import type { Product } from "@/types";
import type { SortKey } from "@/lib/sort";
import ProductGrid from "@/components/product/ProductGrid";
import ProductList from "@/components/product/ProductList";
import Button from "@/components/ui/Button";

function slugifyBrand(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Token must start at a word boundary, so "deal" no longer matches "ideal"
 * while "sams" still matches "samsung". User input is escaped before it reaches
 * RegExp — an unescaped "(" would throw and 500 the route.
 */
function matchesToken(haystack: string, token: string): boolean {
  return new RegExp("(^|[^a-z0-9])" + escapeRegExp(token)).test(haystack);
}

function applySort(list: Product[], sort: SortKey): Product[] {
  if (sort === "relevance") return list;
  const sorted = [...list];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
      );
    default:
      return sorted;
  }
}

interface ShopBrowserProps {
  initialCategory?: string;
  /** Free-text term from the header search (?q=). */
  query?: string;
  sort?: SortKey;
  /** Brand slug from ?brand= — narrows the same way a category does. */
  brand?: string;
  /**
   * `list` renders the dense full-width rows the reference uses for results,
   * `grid` the card grid used for browsing. `auto` picks list when a query is
   * present. Desktop always renders the grid regardless.
   */
  layout?: "grid" | "list" | "auto";
}

// Category scoping is driven purely by the route (/shop/<slug>); the free-text
// query narrows whatever the route selected, so both compose.
export default function ShopBrowser({
  initialCategory = "all",
  query = "",
  sort = "relevance",
  brand,
  layout = "auto",
}: ShopBrowserProps) {
  const term = query.trim();
  const tokens = term.toLowerCase().split(/\s+/).filter(Boolean);

  const matched = products.filter((p) => {
    if (initialCategory !== "all" && p.category !== initialCategory) {
      return false;
    }
    if (brand && slugifyBrand(p.brand ?? "") !== brand) return false;
    if (tokens.length === 0) return true;

    const categoryName = getCategoryBySlug(p.category)?.name ?? p.category;
    // Deliberately excludes `badge` and `condition`: those are facet values,
    // and folding them into free text makes "new" match every listing.
    const haystack =
      `${p.name} ${p.description} ${categoryName} ${p.brand ?? ""}`.toLowerCase();
    // Every word must appear somewhere, so "laptop 16gb" narrows instead of widening.
    return tokens.every((token) => matchesToken(haystack, token));
  });

  const visible = applySort(matched, sort);

  if (visible.length === 0) {
    return (
      <div
        role="status"
        className="mx-auto flex max-w-md animate-fade-in flex-col items-center gap-3 px-4 py-16 text-center"
      >
        <p className="font-sans text-2xl font-extrabold uppercase tracking-tight">
          No matches
        </p>
        <p className="font-sans text-base leading-relaxed text-black/70">
          {`Nothing matches “${term || "this selection"}”. Try fewer words, or browse the full catalogue.`}
        </p>
        <Button
          href={initialCategory === "all" ? "/shop" : `/shop/${initialCategory}`}
          variant="primary"
          className="mt-2"
        >
          Clear search
        </Button>
      </div>
    );
  }

  const useList =
    layout === "list" || (layout === "auto" && (term.length > 0 || !!brand));

  if (!useList) return <ProductGrid products={visible} />;

  // Mobile gets the dense result rows; desktop keeps the grid it has always
  // rendered, so the md+ surface is untouched.
  return (
    <>
      <ProductList products={visible} className="md:hidden" />
      <ProductGrid products={visible} className="hidden md:block" />
    </>
  );
}
