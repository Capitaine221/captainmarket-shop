"use client";

import { useCart } from "@/lib/cart";
import { effectivePriceCents } from "@/lib/money";

type Variant = {
  id: string;
  title: string;
  priceCents: number;
  onSale: boolean;
  salePriceCents: number | null;
  inventoryQuantity: number;
};

export default function QuickAddButton({
  productId,
  productSlug,
  title,
  imageUrl,
  variant,
}: {
  productId: string;
  productSlug: string;
  title: string;
  imageUrl: string | null;
  variant: Variant;
}) {
  const addItem = useCart((s) => s.addItem);
  const outOfStock = variant.inventoryQuantity <= 0;

  return (
    <button
      type="button"
      disabled={outOfStock}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
          variantId: variant.id,
          productId,
          productSlug,
          title,
          variantTitle: variant.title,
          priceCents: effectivePriceCents(variant),
          imageUrl,
        });
      }}
      className="absolute bottom-0 left-0 right-0 bg-ink/90 backdrop-blur text-cream text-xs font-medium py-2.5 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
    >
      {outOfStock ? "Sold out" : "Quick add"}
    </button>
  );
}
