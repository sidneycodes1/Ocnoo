"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from "@/data/categories";
import { getState, getStateByName } from "@/data/nigeria/locations";
import LocationPicker from "@/components/forms/LocationPicker";
import { Labelled, fieldAria, withoutError } from "@/components/forms/Field";
import PhotoUploader from "@/components/sell/PhotoUploader";
import {
  LISTING_CONDITIONS,
  emptyListingDraft,
  useListings,
  type Listing,
  type ListingDraft,
} from "@/context/ListingsContext";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

type ErrorKey = keyof ListingDraft;

/**
 * Compose or edit a listing.
 *
 * Two exits, because a seller rarely finishes an ad in one sitting: "Post ad"
 * publishes it, "Save as draft" keeps it on My ads with everything else. Either
 * way the photos already live in IndexedDB by the time the record is written —
 * the uploader stores as it encodes, so a half-finished ad does not lose the
 * pictures, and `sweepPhotos` on My ads collects anything never attached.
 *
 * The draft stores the state's NAME and the picker speaks in slugs, exactly as in
 * the address form: the delivery zone and every saved address are keyed on the
 * name, so the translation happens here and nowhere else.
 */
interface ListingFormProps {
  /** Present when editing; the id is what routes the save. */
  listing?: Listing;
}

export default function ListingForm({ listing }: ListingFormProps) {
  const router = useRouter();
  const { addListing, updateListing, validate } = useListings();

  const [draft, setDraft] = useState<ListingDraft>(
    listing
      ? {
          title: listing.title,
          price: listing.price,
          categorySlug: listing.categorySlug,
          condition: listing.condition,
          description: listing.description,
          state: listing.state,
          lga: listing.lga,
          town: listing.town,
          photoKeys: listing.photoKeys,
        }
      : emptyListingDraft,
  );
  // Kept as text so "0" and "" are different things while typing, and a price of
  // 0 cannot be silently submitted as if it were intended.
  const [priceText, setPriceText] = useState(
    listing ? String(listing.price) : "",
  );
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});

  function set<K extends ErrorKey>(key: K, value: ListingDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => withoutError(e, key));
  }

  function save(publish: boolean) {
    const withPrice: ListingDraft = {
      ...draft,
      price: Number(priceText.replace(/[^0-9]/g, "")) || 0,
    };
    const nextErrors = validate(withPrice);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const saved = listing
      ? updateListing(listing.id, withPrice)
      : addListing(withPrice, publish);
    if (saved) router.push("/my-ads");
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        save(true);
      }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <PhotoUploader
            value={draft.photoKeys}
            onChange={(keys) => set("photoKeys", keys)}
            error={errors.photoKeys}
            idPrefix="ad-photos"
          />
        </div>

        <Labelled
          label="What are you selling"
          htmlFor="ad-title"
          error={errors.title}
          required
          className="md:col-span-2"
        >
          <Input
            id="ad-title"
            value={draft.title}
            maxLength={80}
            placeholder="e.g. Blender, 1.5L, barely used"
            onChange={(e) => set("title", e.target.value)}
            {...fieldAria("ad-title", Boolean(errors.title))}
          />
        </Labelled>

        <Labelled
          label="Price (Naira)"
          htmlFor="ad-price"
          error={errors.price}
          required
        >
          <Input
            id="ad-price"
            inputMode="numeric"
            value={priceText}
            placeholder="e.g. 14000"
            onChange={(e) => {
              setPriceText(e.target.value.replace(/[^0-9]/g, ""));
              setErrors((prev) => withoutError(prev, "price"));
            }}
            {...fieldAria("ad-price", Boolean(errors.price))}
          />
        </Labelled>

        <Labelled
          label="Category"
          htmlFor="ad-category"
          error={errors.categorySlug}
          required
        >
          <Select
            id="ad-category"
            value={draft.categorySlug}
            placeholder="Select a category…"
            items={categories.map((c) => ({ value: c.slug, label: c.name }))}
            onChange={(e) => set("categorySlug", e.target.value)}
            {...fieldAria("ad-category", Boolean(errors.categorySlug))}
          />
        </Labelled>

        <Labelled label="Condition" htmlFor="ad-condition" required>
          <Select
            id="ad-condition"
            value={draft.condition}
            placeholder={null}
            options={LISTING_CONDITIONS}
            onChange={(e) => set("condition", e.target.value as ListingDraft["condition"])}
          />
        </Labelled>

        <Labelled label="Town or area" htmlFor="ad-town">
          <Input
            id="ad-town"
            value={draft.town}
            maxLength={40}
            placeholder="e.g. Ikeja"
            onChange={(e) => set("town", e.target.value)}
          />
        </Labelled>

        {/* State then the local government inside it. Spans both columns and lays
            its own pair out inside that span. */}
        <LocationPicker
          className="md:col-span-2"
          value={{
            stateId: getStateByName(draft.state)?.id ?? "",
            lgaId: draft.lga,
          }}
          onChange={(next) => {
            const state = next.stateId ? getState(next.stateId) : undefined;
            setDraft((d) => ({ ...d, state: state?.name ?? "", lga: next.lgaId }));
            setErrors((e) => withoutError(withoutError(e, "state"), "lga"));
          }}
          idPrefix="ad-loc"
          required
          stateError={errors.state}
          lgaError={errors.lga}
        />

        <Labelled
          label="Description"
          htmlFor="ad-description"
          error={errors.description}
          required
          className="md:col-span-2"
        >
          <Input
            id="ad-description"
            multiline
            rows={5}
            maxLength={1200}
            value={draft.description}
            placeholder="Condition, what is included, why you are selling. Buyers ask fewer questions when the answer is already here."
            onChange={(e) => set("description", e.target.value)}
            {...fieldAria("ad-description", Boolean(errors.description))}
          />
        </Labelled>
      </div>

      {hasErrors && (
        <p role="alert" className="font-sans text-sm font-bold">
          Check the highlighted fields.
        </p>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:justify-end">
        <Button
          variant="secondary"
          className="w-full md:w-auto"
          onClick={() => router.push("/my-ads")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full md:w-auto"
          onClick={() => save(false)}
        >
          Save as draft
        </Button>
        <Button type="submit" variant="primary" className="w-full md:w-auto">
          {listing ? "Save changes" : "Post ad"}
        </Button>
      </div>
    </form>
  );
}
