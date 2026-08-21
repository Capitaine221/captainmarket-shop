import Link from "next/link";
import Image from "next/image";
import { formatCents } from "@/lib/money";
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
  variants: { id: string; title: string; priceCents: number; inventoryQuantity: number }[];
};

export default function ProductCard({ product }: { product: CardProduct }) {
  const minPrice = product.variants.length ? Math.min(...product.variants.map((v) => v.priceCents)) : 0;
  const inStock = product.variants.some((v) => v.inventoryQuantity > 0);

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
        {!inStock && (
          <span className="absolute top-3 left-3 bg-ink-3 text-cream/70 text-[10px] uppercase tracking-wide px-2 py-1 rounded">
            Sold out
          </span>
        )}
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
        <p className="text-sm text-cream/60 mt-0.5">{formatCents(minPrice)}</p>
      </div>
    </Link>
  );
}
