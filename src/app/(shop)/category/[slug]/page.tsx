import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";

const productInclude = {
  images: { orderBy: { position: "asc" as const }, take: 2 },
  variants: true,
};

function sortProducts<T extends { title: string; variants: { priceCents: number }[] }>(
  products: T[],
  sort: string
) {
  const minPrice = (p: T) => (p.variants.length ? Math.min(...p.variants.map((v) => v.priceCents)) : 0);
  if (sort === "price-asc") return [...products].sort((a, b) => minPrice(a) - minPrice(b));
  if (sort === "price-desc") return [...products].sort((a, b) => minPrice(b) - minPrice(a));
  if (sort === "title-asc") return [...products].sort((a, b) => a.title.localeCompare(b.title));
  return products;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort = "featured" } = await searchParams;

  if (slug === "all") {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: productInclude,
    });
    return (
      <CollectionView
        title="All Products"
        description="Every authenticated piece in the CaptainMarket catalog."
        imageUrl={null}
        products={sortProducts(products, sort)}
      />
    );
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: { include: { product: { include: productInclude } } },
    },
  });
  if (!category) notFound();

  const products = category.products.map((pc) => pc.product).filter((p) => p.status === "ACTIVE");

  return (
    <CollectionView
      title={category.name}
      description={category.description}
      imageUrl={category.imageUrl}
      products={sortProducts(products, sort)}
    />
  );
}

function CollectionView({
  title,
  description,
  imageUrl,
  products,
}: {
  title: string;
  description: string | null;
  imageUrl: string | null;
  products: {
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
  }[];
}) {
  return (
    <div>
      <div className="relative">
        {imageUrl && (
          <div className="absolute inset-0">
            <Image src={imageUrl} alt={title} fill className="object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/40 to-ink" />
          </div>
        )}
        <div className="relative max-w-[1600px] mx-auto px-4 md:px-8 py-16 text-center">
          <h1 className="font-heading text-3xl md:text-4xl mb-3">{title}</h1>
          {description && <p className="text-cream/60 max-w-xl mx-auto">{description}</p>}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pb-20">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-cream/50">{products.length} products</p>
          <SortSelect />
        </div>

        {products.length === 0 ? (
          <p className="text-cream/40 text-sm py-16 text-center">No products in this collection yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
