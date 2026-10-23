/**
 * Geometry for the product waterfalls.
 *
 * The grid is `grid-cols-N` with a small fixed row unit, and each tile spans
 * enough rows to hold it. That keeps DOM order equal to visual order: a CSS
 * `columns` layout would fill the left column top-to-bottom first, which would
 * scramble a section that is sorted by rating.
 *
 * Heights are fixed in px rather than derived from an aspect ratio, because the
 * tile width changes with the viewport. An `aspect-*` image box is a different
 * height at 320px than at 430px, and the row span computed here would no longer
 * match it. A px height is the same at every width, so the arithmetic cannot
 * drift. When real photos arrive with known dimensions, these become the
 * per-product values instead of a derived set.
 *
 * The numbers belong to a layout, not to the page, so each breakpoint gets its
 * own preset. A preset is only ever handed to the DOM branch it was measured
 * for - mobile and desktop are separate subtrees hidden by CSS - so no single
 * element is ever sized by two presets at once.
 *
 * These are numbers only, never class names: `lib/` is outside Tailwind's
 * content globs, so a utility written here would silently never be generated.
 * The column classes live in ProductTileGrid, where the scanner can see them.
 */
export interface TileGeometry {
  /**
   * The visual gutter, applied as the COLUMN gap only. The row axis gets no gap
   * at all - see tilePlan() for why that is what makes the vertical rhythm exact.
   */
  gap: number;
  /** The fine row unit every tile is counted in. */
  rowUnit: number;
  /** Image-box heights in px. Few distinct values read as a calmer stagger. */
  imageHeights: readonly number[];
  /** Reserved caption box: a 2-line name plus one price line. Verified by measurement. */
  captionHeight: number;
  /**
   * A tile that also shows a struck compare-at price reserves more. On mobile at
   * the narrowest supported width (320px, tile 140px) the two amounts do not fit
   * side by side, so PriceTag's `flex-wrap` row breaks - 8px of row gap plus a
   * 16px line. Without the extra reserve the caption outgrows its span and the
   * tile below it is overlapped.
   */
  captionHeightCompareAt: number;
  /** Caption padding in px, counted inside the reserved box. */
  captionPadding: number;
  /**
   * Side of the placeholder glyph in px. It has to grow with the image box or a
   * tall desktop tile shows one small icon stranded in a field of grey.
   */
  placeholderSize: number;
}

/** Image-box heights in px. Four distinct values is enough to look staggered. */
const MOBILE_IMAGE_HEIGHTS = [168, 210, 226, 266];

/**
 * Two columns at 8px, the layout the mobile home page has always used. The
 * column is ~140-170px wide, so these heights sit between square and portrait.
 */
export const MOBILE_TILES: TileGeometry = {
  gap: 8,
  rowUnit: 2,
  imageHeights: MOBILE_IMAGE_HEIGHTS,
  captionHeight: 88,
  captionHeightCompareAt: 112,
  captionPadding: 8,
  placeholderSize: 44,
};

/**
 * Desktop wall: 16px gutters, which is what Pinterest measures (Jiji uses 20 at
 * a wider container). Three heights instead of mobile's four, because a wall
 * this large reads as messy rather than varied if the spread is wider - and
 * with no real photography yet, every height difference is synthetic.
 *
 * At the 1152px content width a 4-column tile is 268px, so these heights land
 * between 1.25 and 1.67 portrait - the middle of Pinterest's measured 1.0-2.05
 * spread. The caption reserve is smaller than mobile's compare-at case because
 * the two prices fit on one line at this width; it only has to absorb the
 * narrower 3-column tile at 768px.
 */
export const DESKTOP_TILES: TileGeometry = {
  gap: 16,
  rowUnit: 2,
  imageHeights: [336, 392, 448],
  captionHeight: 88,
  captionHeightCompareAt: 104,
  captionPadding: 12,
  placeholderSize: 64,
};

/**
 * A stable index for a product id, so a tile is the same height in every
 * section and across reloads. Summing char codes keeps working if the ids stop
 * being numeric.
 */
function ratioIndex(id: string, count: number): number {
  let total = 0;
  for (let i = 0; i < id.length; i += 1) total += id.charCodeAt(i);
  return total % count;
}

export interface TilePlan {
  imageHeight: number;
  captionHeight: number;
  captionPadding: number;
  rowSpan: number;
}

export function tilePlan(
  id: string,
  hasCompareAtPrice = false,
  geometry: TileGeometry = MOBILE_TILES
): TilePlan {
  const { imageHeights, gap, rowUnit } = geometry;
  const imageHeight = imageHeights[ratioIndex(id, imageHeights.length)];
  const captionHeight = hasCompareAtPrice
    ? geometry.captionHeightCompareAt
    : geometry.captionHeight;
  /** 1px hairline top + bottom, counted so a span covers the whole box. */
  const height = imageHeight + captionHeight + 2;
  // The row axis carries no gap, so N rows are exactly N * rowUnit tall and the
  // span has to cover both the tile and the gutter under it:
  //   N = ceil((height + gap) / rowUnit)
  // which leaves the rendered gap between gap and gap + rowUnit - at most one
  // row of error, instead of a whole row-plus-gap of it.
  //
  // The alternative (a real row-gap on the row axis) quantises to rowUnit + gap,
  // so with a 2px unit and a 16px gutter every gap in the wall came out anywhere
  // from 16 to 34px: no overlap, but an obviously uneven rhythm. Every height in
  // both presets is even and every gap is even, so the division is exact here and
  // the gutters measure to the pixel.
  return {
    imageHeight,
    captionHeight,
    captionPadding: geometry.captionPadding,
    rowSpan: Math.ceil((height + gap) / rowUnit),
  };
}
