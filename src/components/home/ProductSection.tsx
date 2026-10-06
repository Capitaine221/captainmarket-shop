import Link from "next/link";
import ProductCard from "@/components/ProductCard";

type CardProduct = {
  id: string;
  slug: string;
  title: string;
  vendor: string | null;
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

export default function ProductSection({
  title,
  description,
  viewAllHref,
  products,
  tinted = false,
}: {
  title: string;
  description: string;
  viewAllHref: string;
  products: CardProduct[];
  tinted?: boolean;
}) {
  return (
    <section className={tinted ? "bg-ink-2 border-y border-line" : ""}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-14 md:py-20">
        <div className="flex items-end justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="font-heading text-2xl md:text-4xl mb-2">{title}</h2>
            <p className="text-muted text-sm md:text-base">{description}</p>
          </div>
          <Link
            href={viewAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:gap-2.5 transition-all whitespace-nowrap"
          >
            View all <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="sm:hidden mt-8 text-center">
          <Link href={viewAllHref} className="btn-secondary px-6 py-3 text-sm">
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}
