/**
 * A single product page resolves against the same catalogue read as the rest of
 * the site, so this covers the slow case a buyer actually notices: following a
 * link from the shop and getting a blank white column where the gallery should
 * be. The two-column shape matches the real page at `lg`.
 */
export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6" aria-busy="true" aria-label="Loading product">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="aspect-square w-full animate-pulse rounded-2xl bg-surface" />
        <div className="flex flex-col gap-3">
          <div className="h-4 w-24 animate-pulse rounded bg-surface" />
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-surface" />
          <div className="h-5 w-32 animate-pulse rounded bg-surface" />
          <div className="mt-2 h-24 w-full animate-pulse rounded-xl bg-surface" />
          <div className="mt-2 h-12 w-full animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
    </div>
  );
}
