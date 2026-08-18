"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatCents } from "@/lib/money";
import WishlistButton from "@/components/WishlistButton";

type Variant = {
  id: string;
  title: string;
  priceCents: number;
  inventoryQuantity: number;
  option1Value: string | null;
  option2Value: string | null;
  option3Value: string | null;
  imageUrl: string | null;
};

type ProductImg = { url: string };

function variantOptionValue(v: Variant, index: number) {
  return index === 0 ? v.option1Value : index === 1 ? v.option2Value : v.option3Value;
}

export default function ProductInteractive({
  productId,
  productSlug,
  title,
  vendor,
  images,
  variants,
  optionNames,
}: {
  productId: string;
  productSlug: string;
  title: string;
  vendor?: string | null;
  images: ProductImg[];
  variants: Variant[];
  optionNames: (string | null)[];
}) {
  const activeOptionNames = optionNames.filter((n): n is string => !!n);
  const hasStructuredOptions = activeOptionNames.length > 0;

  const initialVariant = variants.find((v) => v.inventoryQuantity > 0) ?? variants[0];

  const [selected, setSelected] = useState<(string | null)[]>(() =>
    activeOptionNames.map((_, i) => (initialVariant ? variantOptionValue(initialVariant, i) : null))
  );
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(
    initialVariant?.imageUrl ?? images[0]?.url ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((s) => s.addItem);

  const optionGroups = useMemo(() => {
    return activeOptionNames.map((name, i) => {
      const seen = new Set<string>();
      const values: string[] = [];
      for (const v of variants) {
        const val = variantOptionValue(v, i);
        if (val && !seen.has(val)) {
          seen.add(val);
          values.push(val);
        }
      }
      return { name, index: i, values };
    });
  }, [activeOptionNames, variants]);

  const matchedVariant = useMemo(() => {
    if (!hasStructuredOptions) return variants[0];
    return variants.find((v) => activeOptionNames.every((_, i) => variantOptionValue(v, i) === selected[i]));
  }, [variants, selected, activeOptionNames, hasStructuredOptions]);

  const outOfStock = !matchedVariant || matchedVariant.inventoryQuantity <= 0;

  const galleryImages = images.length > 0 ? images : matchedVariant?.imageUrl ? [{ url: matchedVariant.imageUrl }] : [];
  const activeIndex = Math.max(
    0,
    galleryImages.findIndex((img) => img.url === activeImageUrl)
  );

  function selectOption(index: number, value: string) {
    const next = [...selected];
    next[index] = value;
    setSelected(next);

    const nextVariant = variants.find((v) =>
      activeOptionNames.every((_, i) => variantOptionValue(v, i) === next[i])
    );
    if (nextVariant?.imageUrl) {
      setActiveImageUrl(nextVariant.imageUrl);
    }
  }

  function isValueAvailable(index: number, value: string) {
    return variants.some((v) => {
      if (variantOptionValue(v, index) !== value) return false;
      return activeOptionNames.every((_, i) => {
        if (i === index) return true;
        return selected[i] == null || variantOptionValue(v, i) === selected[i];
      });
    });
  }

  function goToImage(delta: number) {
    if (galleryImages.length === 0) return;
    const next = (activeIndex + delta + galleryImages.length) % galleryImages.length;
    setActiveImageUrl(galleryImages[next].url);
  }

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Gallery */}
      <div className="flex gap-3">
        {galleryImages.length > 1 && (
          <div className="hidden sm:flex flex-col gap-3 w-16 shrink-0 max-h-[560px] overflow-y-auto">
            {galleryImages.map((img, i) => (
              <button
                key={img.url + i}
                onClick={() => setActiveImageUrl(img.url)}
                className={`relative aspect-square rounded-md overflow-hidden border shrink-0 transition-colors ${
                  activeIndex === i ? "border-gold" : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt={`${title} ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 relative aspect-square rounded-card overflow-hidden bg-ink-2">
          {galleryImages.length > 0 && activeImageUrl && (
            <Image src={activeImageUrl} alt={title} fill priority className="object-contain" />
          )}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={() => goToImage(-1)}
                aria-label="Image précédente"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center hover:bg-ink text-cream"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => goToImage(1)}
                aria-label="Image suivante"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/70 backdrop-blur flex items-center justify-center hover:bg-ink text-cream"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Info + options */}
      <div>
        {vendor && <p className="text-xs uppercase tracking-wide text-cream/40 mb-2">{vendor}</p>}
        <h1 className="font-heading text-2xl md:text-3xl mb-4">{title}</h1>

        <div className="text-2xl font-heading mb-6">{matchedVariant ? formatCents(matchedVariant.priceCents) : ""}</div>

        {optionGroups.map((group) => (
          <div key={group.name} className="mb-6">
            <p className="text-xs uppercase tracking-wide text-cream/50 mb-2">{group.name}</p>
            <div className="flex flex-wrap gap-2">
              {group.values.map((value) => {
                const isSelected = selected[group.index] === value;
                const available = isValueAvailable(group.index, value);
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!available}
                    onClick={() => selectOption(group.index, value)}
                    className={`px-4 py-2 text-sm rounded-btn border transition-colors ${
                      isSelected ? "border-gold text-gold" : "border-white/20 text-cream/80 hover:border-white/40"
                    } ${!available ? "opacity-30 line-through cursor-not-allowed" : ""}`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs uppercase tracking-wide text-cream/50">Quantity</span>
          <div className="flex items-center border border-white/20 rounded-btn">
            <button type="button" className="w-9 h-9 text-cream/80" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              −
            </button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <button type="button" className="w-9 h-9 text-cream/80" onClick={() => setQuantity((q) => q + 1)}>
              +
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            disabled={outOfStock}
            onClick={() => {
              if (!matchedVariant) return;
              addItem(
                {
                  variantId: matchedVariant.id,
                  productId,
                  productSlug,
                  title,
                  variantTitle: matchedVariant.title,
                  priceCents: matchedVariant.priceCents,
                  imageUrl: matchedVariant.imageUrl ?? images[0]?.url ?? null,
                },
                quantity
              );
            }}
            className="btn-primary flex-1 py-3.5 text-sm font-semibold disabled:opacity-40"
          >
            {outOfStock ? "Sold out" : "Add to cart"}
          </button>
          <WishlistButton slug={productSlug} className="w-12 h-12 shrink-0 !rounded-btn border border-white/20 !bg-transparent" />
        </div>
      </div>
    </div>
  );
}
