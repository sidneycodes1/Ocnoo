// Delivery zones and the complete Nigerian state list.
//
// ⚠ THE FEE FIGURES ARE PLACEHOLDERS. The billing policy says delivery charges
// depend on destination, size, weight and the chosen courier, and must be
// disclosed before payment — so the business has to confirm real rates before
// launch. Nothing here is a quoted OCNOO fee.

import { NG_STATE_NAMES, resolveStateName } from "@/data/nigeria/locations";

/**
 * 36 states + the FCT, from `data/nigeria/locations.ts` — the one place the
 * names are defined. This used to carry its own hand-typed list that called the
 * FCT "FCT - Abuja"; the dataset's official name is "Federal Capital
 * Territory", and `resolveStateName` below is what keeps an address saved under
 * the old label from becoming invalid.
 */
export const NG_STATES: string[] = NG_STATE_NAMES;

const ZONE_A = [
  "Lagos",
  "Ogun",
  "Oyo",
  "Osun",
  "Ondo",
  "Ekiti",
];

const ZONE_B = [
  "Federal Capital Territory",
  "Abia",
  "Akwa Ibom",
  "Anambra",
  "Bayelsa",
  "Benue",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Enugu",
  "Imo",
  "Kogi",
  "Nasarawa",
  "Rivers",
];

export interface DeliveryQuote {
  fee: number;
  zone: "A" | "B" | "C";
  label: string;
}

/**
 * Flat placeholder quote per state. Unknown/empty state → highest zone.
 * The argument is resolved first, so a legacy "FCT - Abuja" still prices as the
 * FCT rather than falling into the most expensive bucket.
 */
export function getDeliveryQuote(state: string): DeliveryQuote {
  const canonical = resolveStateName(state);
  if (ZONE_A.includes(canonical)) {
    return { fee: 2500, zone: "A", label: "South West / Lagos corridor" };
  }
  if (ZONE_B.includes(canonical)) {
    return { fee: 4500, zone: "B", label: "South East & South South" };
  }
  return { fee: 6500, zone: "C", label: "North central & North" };
}
