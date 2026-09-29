import Button from "@/components/ui/Button";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

interface MobileStickyBarProps {
  onAddToCart: () => void;
  disabled?: boolean;
}

// Fixed bottom action bar, small screens only (hidden at md and up).
export default function MobileStickyBar({
  onAddToCart,
  disabled = false,
}: MobileStickyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-black bg-white md:hidden">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Button
          variant="primary"
          className="flex-1"
          disabled={disabled}
          onClick={onAddToCart}
        >
          {disabled ? "Out of Stock" : "Add to Cart"}
        </Button>
        <WhatsAppButton iconOnly />
      </div>
    </div>
  );
}
