import { prisma } from "@/lib/prisma";
import Hero from "@/components/home/Hero";
import CategoryGrid from "@/components/home/CategoryGrid";
import ProductSection from "@/components/home/ProductSection";
import ShowcaseBanner from "@/components/home/ShowcaseBanner";
import Reviews from "@/components/home/Reviews";
import Newsletter from "@/components/home/Newsletter";

const FEATURED_CATEGORY_SLUGS = ["t-shirts", "hoodies", "jackets", "sneakers", "accessories", "luxury-perfumes"];

const productCardInclude = {
  images: { orderBy: { position: "asc" as const }, take: 2 },
  variants: true,
};

export default async function HomePage() {
  const [categoriesRaw, newArrivalsCat, bestSellersCat, luxuryPerfumesCat, streetwearCat, accessoriesCat] =
    await Promise.all([
      prisma.category.findMany({
        where: { slug: { in: FEATURED_CATEGORY_SLUGS } },
        select: { slug: true, name: true, imageUrl: true },
      }),
      prisma.category.findUnique({
        where: { slug: "new-arrivals" },
        include: { products: { include: { product: { include: productCardInclude } }, take: 8 } },
      }),
      prisma.category.findUnique({
        where: { slug: "best-sellers" },
        include: { products: { include: { product: { include: productCardInclude } }, take: 8 } },
      }),
      prisma.category.findUnique({ where: { slug: "luxury-perfumes" } }),
      prisma.category.findUnique({
        where: { slug: "streetwear" },
        include: { products: { take: 1, include: { product: { include: { images: { take: 1 } } } } } },
      }),
      prisma.category.findUnique({ where: { slug: "accessories" } }),
    ]);

  const categories = FEATURED_CATEGORY_SLUGS.map(
    (slug) => categoriesRaw.find((c) => c.slug === slug) ?? { slug, name: slug, imageUrl: null }
  );

  const newArrivals = (newArrivalsCat?.products ?? []).map((pc) => pc.product);
  const bestSellers = (bestSellersCat?.products ?? []).map((pc) => pc.product);
  const streetwearImage = streetwearCat?.products[0]?.product.images[0]?.url ?? null;

  return (
    <>
      <Hero />
      <CategoryGrid categories={categories} />
      <ProductSection
        title="New Arrivals"
        description="Just landed and ready to ship."
        viewAllHref="/category/new-arrivals"
        products={newArrivals}
      />
      <ProductSection
        title="Best Sellers"
        description="The pieces our clients keep coming back for."
        viewAllHref="/category/best-sellers"
        products={bestSellers}
        tinted
      />
      <ShowcaseBanner
        eyebrow="Luxury Fragrance"
        title="Signature Scents"
        description="Authenticated designer fragrances, curated for a scent that speaks before you do."
        buttonLabel="Shop Fragrance"
        href="/category/luxury-perfumes"
        imageUrl={luxuryPerfumesCat?.imageUrl ?? null}
      />
      <ShowcaseBanner
        eyebrow="Streetwear"
        title="Tees, Hoodies & Outerwear"
        description="Archive-grade streetwear staples, authenticated piece by piece."
        buttonLabel="Shop Streetwear"
        href="/category/streetwear"
        imageUrl={streetwearImage}
      />
      <ShowcaseBanner
        eyebrow="Accessories"
        title="Finish The Look"
        description="Jewelry, leather goods, and small accents that carry the whole fit."
        buttonLabel="Shop Accessories"
        href="/category/accessories"
        imageUrl={accessoriesCat?.imageUrl ?? null}
      />
      <Reviews />
      <Newsletter />
    </>
  );
}
