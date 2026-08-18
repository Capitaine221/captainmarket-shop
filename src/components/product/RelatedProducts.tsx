import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export default async function RelatedProducts({
  categoryId,
  excludeProductId,
}: {
  categoryId: string | null;
  excludeProductId: string;
}) {
  if (!categoryId) return null;

  const links = await prisma.productCategory.findMany({
    where: { categoryId, productId: { not: excludeProductId } },
    take: 4,
    include: {
      product: {
        include: { images: { orderBy: { position: "asc" }, take: 2 }, variants: true },
      },
    },
  });

  const products = links.map((l) => l.product).filter((p) => p.status === "ACTIVE");
  if (products.length === 0) return null;

  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 border-t border-white/10">
      <h2 className="font-heading text-2xl mb-8">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
