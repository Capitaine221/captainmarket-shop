import Link from "next/link";
import Image from "next/image";
import { effectivePriceCents, formatCents } from "@/lib/money";
import WishlistButton from "./WishlistButton";
import QuickAddButton from "./QuickAddButton";
import BuyLinkButton from "./BuyLinkButton";

type CardProduct = {
  id: string;
  slug: string;
  title: string;
  vendor: string | null;
  externalUrl?: string | null;
  images: { url: string }[];
  variants: {
    id: string;
    title: string;
    priceCents: number;
    onSale: boolean;
    salePriceCents: number | null;
    inventoryQuantity: number;
  }[];
};

export default function ProductCard({ product }: { product: CardProduct }) {
  const inStock = product.variants.some((v) => v.inventoryQuantity > 0);

  const cheapest = product.variants.reduce<typeof product.variants[number] | null>((best, v) => {
    const price = effectivePriceCents(v);
    return !best || price < effectivePriceCents(best) ? v : best;
  }, null);
  const displayPriceCents = cheapest ? effectivePriceCents(cheapest) : 0;
  const onSale = cheapest?.onSale && cheapest.salePriceCents != null;
  const discountPct =
    onSale && cheapest && cheapest.priceCents > 0
      ? Math.round((1 - displayPriceCents / cheapest.priceCents) * 100)
      : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group card-hover block rounded-card bg-card border border-line overflow-hidden"
    >
      <div className="relative aspect-square bg-ink-2 overflow-hidden">
        {product.images[0] && (
          <Image
            src={product.images[0].url}
            alt={product.title}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105"
          />
        )}
        {product.images[1] && (
          <Image
            src={product.images[1].url}
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {onSale && (
            <span className="bg-sale text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md">
              Sale{discountPct > 0 ? ` −${discountPct}%` : ""}
            </span>
          )}
          {!inStock && (
            <span className="bg-ink/90 text-cream/80 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md">
              Sold out
            </span>
          )}
        </div>
        <WishlistButton slug={product.slug} className="absolute top-3 right-3" />
        {product.externalUrl ? (
          <BuyLinkButton url={product.externalUrl} />
        ) : (
          product.variants.length === 1 && (
            <QuickAddButton
              productId={product.id}
              productSlug={product.slug}
              title={product.title}
              imageUrl={product.images[0]?.url ?? null}
              variant={product.variants[0]}
            />
          )
        )}
      </div>
      <div className="p-3.5 md:p-4">
        {product.vendor && (
          <p className="text-[11px] uppercase tracking-wide text-muted mb-1">{product.vendor}</p>
        )}
        <h3 className="text-sm md:text-[15px] font-semibold text-cream group-hover:text-gold transition-colors line-clamp-2 min-h-[2.6em]">
          {product.title}
        </h3>
        <p className="mt-2 flex items-baseline gap-2">
          {onSale && cheapest ? (
            <>
              <span className="font-heading text-lg text-gold">{formatCents(displayPriceCents)}</span>
              <span className="text-xs text-muted line-through">{formatCents(cheapest.priceCents)}</span>
            </>
          ) : (
            <span className="font-heading text-lg text-cream">{formatCents(displayPriceCents)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
