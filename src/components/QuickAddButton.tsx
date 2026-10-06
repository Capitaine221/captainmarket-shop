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
      className="btn-primary absolute inset-x-3 bottom-3 text-xs py-2.5 md:opacity-0 md:translate-y-1 md:group-hover:opacity-100 md:group-hover:translate-y-0 disabled:hidden"
    >
      {outOfStock ? "Sold out" : "Quick add"}
    </button>
  );
}
