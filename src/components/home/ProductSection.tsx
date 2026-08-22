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
    <section className={tinted ? "bg-ink-2" : ""}>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-16">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl mb-2">{title}</h2>
            <p className="text-cream/60 text-sm">{description}</p>
          </div>
          <Link href={viewAllHref} className="hidden sm:block text-sm text-gold hover:underline whitespace-nowrap">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="sm:hidden mt-8 text-center">
          <Link href={viewAllHref} className="text-sm text-gold hover:underline">
            View all
          </Link>
        </div>
      </div>
    </section>
  );
}
