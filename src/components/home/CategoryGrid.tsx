import Link from "next/link";
import Image from "next/image";

type Cat = { slug: string; name: string; imageUrl: string | null };

export default function CategoryGrid({ categories }: { categories: Cat[] }) {
  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-14 md:py-20">
      <div className="text-center mb-10">
        <p className="eyebrow mb-3">Browse</p>
        <h2 className="font-heading text-3xl md:text-4xl">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group card-hover block rounded-card overflow-hidden bg-card border border-line"
          >
            <div className="relative aspect-square bg-ink-2 overflow-hidden">
              {c.imageUrl ? (
                <Image
                  src={c.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-card-2 to-card" />
              )}
            </div>
            <div className="flex items-center justify-between gap-2 px-4 py-3.5">
              <span className="font-heading text-sm md:text-base leading-tight group-hover:text-gold transition-colors">
                {c.name}
              </span>
              <span
                aria-hidden="true"
                className="grid place-items-center w-7 h-7 shrink-0 rounded-full border border-line text-gold group-hover:bg-gold group-hover:text-[#1a1400] group-hover:border-gold transition-colors"
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
