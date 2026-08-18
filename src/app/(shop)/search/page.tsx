import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();

  const products = query
    ? await prisma.product.findMany({
        where: {
          status: "ACTIVE",
          title: { contains: query },
        },
        include: { images: { orderBy: { position: "asc" }, take: 2 }, variants: true },
      })
    : [];

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-14">
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Search</h1>
      <form className="max-w-lg mb-10">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search products"
          className="w-full bg-ink-2 border border-white/15 rounded-btn px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold"
        />
      </form>

      {query && (
        <p className="text-sm text-cream/50 mb-8">
          {products.length} result{products.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
        </p>
      )}

      {query && products.length === 0 && (
        <p className="text-cream/40 text-sm">No products found. Try a different search.</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
