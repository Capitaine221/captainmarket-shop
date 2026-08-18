import Link from "next/link";
import Image from "next/image";

type Cat = { slug: string; name: string; imageUrl: string | null };

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-16">
      <h2 className="font-heading text-2xl md:text-3xl text-center mb-10">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="group block">
            <div className="aspect-square rounded-card overflow-hidden bg-ink-2 relative">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt={c.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-cream/30 text-xs">
                  {c.name}
                </div>
              )}
            </div>
            <p className="text-sm text-center mt-3 text-cream/80 group-hover:text-gold transition-colors">
              {c.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
