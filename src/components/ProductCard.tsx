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

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-square rounded-card overflow-hidden bg-ink-2">
        {product.images[0] && (
          <Image
            src={product.images[0].url}
            alt={product.title}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-0"
          />
        )}
        {product.images[1] && (
          <Image
            src={product.images[1].url}
            alt={product.title}
            fill
            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
          {onSale && (
            <span className="bg-gold text-ink text-[10px] uppercase tracking-wide px-2 py-1 rounded font-semibold">
              Sale
            </span>
          )}
          {!inStock && (
            <span className="bg-ink-3 text-cream/70 text-[10px] uppercase tracking-wide px-2 py-1 rounded">
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
      <div className="mt-3">
        {product.vendor && (
          <p className="text-[10px] uppercase tracking-wide text-cream/40">{product.vendor}</p>
        )}
        <h3 className="text-sm font-medium text-cream/90 group-hover:text-gold transition-colors line-clamp-1">
          {product.title}
        </h3>
        <p className="text-sm mt-0.5">
          {onSale && cheapest ? (
            <>
              <span className="text-cream/40 line-through mr-1.5">{formatCents(cheapest.priceCents)}</span>
              <span className="text-gold">{formatCents(displayPriceCents)}</span>
            </>
          ) : (
            <span className="text-cream/60">{formatCents(displayPriceCents)}</span>
          )}
        </p>
      </div>
    </Link>
  );
}
