import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-[600px] md:h-[720px] w-full overflow-hidden">
      <Image
        src="/hero-cover.png"
        alt="CaptainMarket"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/20" />
      <div className="relative h-full max-w-[1600px] mx-auto px-6 md:px-12 flex items-center">
        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-gold mb-4">Est. Curated Resale</p>
          <h1 className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] mb-5">
            Rare Fashion. Premium quality.
          </h1>
          <p className="text-cream/70 mb-8 max-w-md">
            Streetwear, sneakers, accessories, and fragrance — hand-picked and authenticated for those who
            demand the real thing.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/category/new-arrivals" className="btn-primary px-7 py-3.5 text-sm font-semibold">
              Shop New Arrivals
            </Link>
            <Link href="/category/all" className="btn-secondary px-7 py-3.5 text-sm font-semibold">
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
