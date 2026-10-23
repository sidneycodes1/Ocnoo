import Button from "@/components/ui/Button";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

interface MobileStickyBarProps {
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
  added?: boolean;
}

// Fixed bottom action bar, small screens only (hidden at md and up).
//
// Reference layout: WhatsApp shortcut + outlined "Add to Cart" pill + filled
// "Buy Now" pill. When the item is unavailable the bar used to disappear
// entirely, leaving mobile shoppers with no action at all — it now falls back
// to the chat-to-order route instead.
export default function MobileStickyBar({
  onAddToCart,
  onBuyNow,
  disabled = false,
  added = false,
}: MobileStickyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-safe md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        {disabled ? (
          <WhatsAppButton
            label="Chat About This Item"
            mobile
            className="min-w-0 flex-1 text-sm whitespace-nowrap"
          />
        ) : (
          <>
            <WhatsAppButton iconOnly />
            <Button
              variant="secondary"
              shape="pill"
              tone="primary"
              labelCase="none"
              padding="tight"
              className="min-w-0 flex-1 text-sm whitespace-nowrap"
              onClick={onAddToCart}
            >
              {added ? "Added \u2713" : "Add to Cart"}
            </Button>
            <Button
              variant="primary"
              shape="pill"
              tone="primary"
              labelCase="none"
              padding="tight"
              className="min-w-0 flex-1 text-sm whitespace-nowrap"
              onClick={onBuyNow}
            >
              Buy Now
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
