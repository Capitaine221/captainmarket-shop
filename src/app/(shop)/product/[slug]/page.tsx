import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Tabs from "@/components/product/Tabs";
import TrustBadges from "@/components/TrustBadges";
import RelatedProducts from "@/components/product/RelatedProducts";
import ShareButton from "@/components/ShareButton";
import ProductInteractive from "./ProductInteractive";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: true,
      categories: { take: 1 },
    },
  });
  if (!product || product.status !== "ACTIVE") notFound();

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-10">
      <ProductInteractive
        productId={product.id}
        productSlug={product.slug}
        title={product.title}
        vendor={product.vendor}
        images={product.images}
        variants={product.variants}
        optionNames={[product.option1Name, product.option2Name, product.option3Name]}
        externalUrl={product.externalUrl}
      />

      <div className="md:grid md:grid-cols-2 md:gap-12">
        <div />
        <div>
          {product.description && (
            <div className="mt-2 text-sm text-cream/60 whitespace-pre-line leading-relaxed">
              {product.description}
            </div>
          )}

          <Tabs />
          <ShareButton />
        </div>
      </div>

      <div className="mt-12">
        <TrustBadges />
      </div>

      <RelatedProducts categoryId={product.categories[0]?.categoryId ?? null} excludeProductId={product.id} />
    </div>
  );
}
