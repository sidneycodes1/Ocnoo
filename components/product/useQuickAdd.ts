"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/types";
import { useCart } from "@/context/CartContext";

/**
 * Quick-add with a 1.4s "added" tick, shared by the desktop product card and
 * the waterfall tile so the two cannot drift apart.
 *
 * The timer is cleared on unmount: a tile removed by a search refinement while
 * its tick is pending would otherwise fire setState on a dead tree.
 */
export function useQuickAdd(product: Product) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) window.clearTimeout(addedTimer.current);
    },
    []
  );

  const quickAdd = useCallback(() => {
    addItem(product.id, 1);
    setAdded(true);
    if (addedTimer.current) window.clearTimeout(addedTimer.current);
    addedTimer.current = window.setTimeout(() => setAdded(false), 1400);
  }, [addItem, product.id]);

  return { added, quickAdd };
}
