/**
 * Shown while a shop route resolves.
 *
 * The root layout already reads the catalogue, so most of the wait happens
 * before this — a `loading.tsx` cannot cover the layout's own suspension, which
 * is why the grid columns below match `ProductGrid` exactly: when the real
 * cards arrive they land in the boxes the skeleton drew, instead of the page
 * jumping.
 */
export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6" aria-busy="true" aria-label="Loading products">
      <div className="mb-5 flex flex-col gap-3">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
        <div className="h-4 w-72 animate-pulse rounded bg-surface" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="aspect-square w-full animate-pulse rounded-xl bg-surface" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
