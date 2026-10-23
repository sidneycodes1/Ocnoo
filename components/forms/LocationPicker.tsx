"use client";

import {
  NG_STATES_LIST,
  getLgaInState,
  getState,
  lgaLabelFor,
} from "@/data/nigeria/locations";
import Select from "@/components/ui/Select";

/**
 * The administrative half of a Nigerian address: state (or the FCT's area
 * council), then the local government inside it.
 *
 * Two rules live here rather than in each consumer, because a cascade that can
 * be assembled wrongly will be:
 *   1. Choosing a state clears the chosen LGA. An LGA id is namespaced to its
 *      state (`kano/nasarawa` is a different place from `nasarawa/nasarawa`), so
 *      carrying one across is always a wrong answer, never a stale convenience.
 *   2. A value that does not resolve inside its own state is not rendered. The
 *      `<select>` would otherwise show a blank while holding a real value.
 *
 * It also renders its own container, rather than returning a fragment of two
 * bare labels. A fragment auto-flows into whatever grid the consumer uses, so
 * the pair lands in unrelated cells — the state top-right and the LGA
 * bottom-left, with an orphan gap beside it. One container keeps them adjacent,
 * and a consumer only ever decides how wide that container is (`className`).
 *
 * The lists are native `<select>`s on purpose: 774 names ship as 3.7 KB of
 * gzipped data, the OS gives type-ahead and a proper picker on a phone, and a
 * custom combobox would trade all of that for an accessibility problem.
 */

export interface LocationValue {
  /** Slug from `data/nigeria/locations.ts`, e.g. `lagos`. */
  stateId: string;
  /** `state-slug/lga-slug`, e.g. `lagos/ikeja`. */
  lgaId: string;
}

export const emptyLocation: LocationValue = { stateId: "", lgaId: "" };

interface LocationPickerProps {
  value: LocationValue;
  onChange: (next: LocationValue) => void;
  stateError?: string;
  lgaError?: string;
  /** Prefix for the generated element ids. Override if a page renders two. */
  idPrefix?: string;
  required?: boolean;
  /** Placement inside the parent layout, e.g. `md:col-span-2` in a form grid. */
  className?: string;
}

export default function LocationPicker({
  value,
  onChange,
  stateError,
  lgaError,
  idPrefix = "loc",
  required = false,
  className = "",
}: LocationPickerProps) {
  const state = getState(value.stateId);
  // Only echo an LGA that genuinely belongs to the chosen state.
  const lgaId = state && getLgaInState(state.id, value.lgaId) ? value.lgaId : "";
  const stateId = `${idPrefix}-state`;
  const lgaIdName = `${idPrefix}-lga`;

  const aria = (id: string, invalid: boolean) =>
    invalid
      ? { "aria-invalid": true as const, "aria-describedby": `${id}-error` }
      : {};

  return (
    <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${className}`}>
      {/* Until a state exists there is nothing beside it to pair with, so it
          takes the whole row instead of leaving a gap in the second column. */}
      <label
        htmlFor={stateId}
        className={`flex flex-col gap-1 ${state ? "" : "md:col-span-2"}`}
      >
        <span className="font-sans text-sm font-bold uppercase tracking-wide">
          State {required && <span aria-hidden="true">*</span>}
        </span>
        <Select
          id={stateId}
          value={value.stateId}
          placeholder="Select a state…"
          aria-label="Delivery state"
          items={NG_STATES_LIST.map((s) => ({ value: s.id, label: s.name }))}
          onChange={(e) => {
            // Dependent-clear lives here so no consumer can forget it.
            onChange({ stateId: e.target.value, lgaId: "" });
          }}
          {...aria(stateId, Boolean(stateError))}
        />
        {stateError && (
          <span
            id={`${stateId}-error`}
            className="font-sans text-sm font-bold"
            role="alert"
          >
            {stateError}
          </span>
        )}
      </label>

      {state && (
        <label htmlFor={lgaIdName} className="flex flex-col gap-1">
          <span className="font-sans text-sm font-bold uppercase tracking-wide">
            {lgaLabelFor(state)} {required && <span aria-hidden="true">*</span>}
          </span>
          <Select
            id={lgaIdName}
            value={lgaId}
            placeholder={`Select ${lgaLabelFor(state).toLowerCase()}…`}
            items={state.lgas.map((l) => ({ value: l.id, label: l.name }))}
            onChange={(e) => onChange({ stateId: state.id, lgaId: e.target.value })}
            {...aria(lgaIdName, Boolean(lgaError))}
          />
          {/* Says out loud that the cascade loaded the right slice, and gives
              the number a person uses to sanity-check it. */}
          <span className="font-sans text-xs text-black/45">
            {state.lgas.length}{" "}
            {state.isFct ? "area councils" : "local governments"} in {state.name}
          </span>
          {lgaError && (
            <span
              id={`${lgaIdName}-error`}
              className="font-sans text-sm font-bold"
              role="alert"
            >
              {lgaError}
            </span>
          )}
        </label>
      )}
    </div>
  );
}

/** Names for a stored pair, tolerating an id that no longer resolves. */
export function locationNames(value: LocationValue): {
  stateName: string;
  lgaName: string;
} {
  const state = getState(value.stateId);
  const lga = state ? getLgaInState(state.id, value.lgaId) : undefined;
  return { stateName: state?.name ?? "", lgaName: lga?.name ?? "" };
}
