/**
 * Fallback for the `@modal` parallel slot. Every route needs a matching file for
 * each slot, or the slot renders nothing at all; this is that file for every
 * screen a product sheet isn't open on.
 */
export default function ModalDefault() {
  return null;
}
