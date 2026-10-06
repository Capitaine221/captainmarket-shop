import Link from "next/link";
import Image from "next/image";

const PERKS = ["Insured shipping worldwide", "Secure checkout", "7-day easy returns"];

export default function Hero() {
  return (
    <section className="max-w-[1600px] mx-auto px-3 md:px-8 pt-4 md:pt-6">
      <div className="relative min-h-[520px] md:min-h-[640px] overflow-hidden rounded-[22px] border border-line">
        <Image
          src="/hero-cover.png"
          alt="CaptainMarket"
          fill
          priority
          sizes="(min-width: 1600px) 1536px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/55 to-ink/5" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink/60 to-transparent" />
        <div className="relative min-h-[520px] md:min-h-[640px] px-6 md:px-14 flex items-center">
          <div className="max-w-xl py-12">
            <p className="eyebrow mb-5">Est. Curated Resale</p>
            <h1 className="font-heading text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.02] mb-5">
              Rare Fashion.{" "}
              <span className="bg-gradient-to-r from-gold-2 to-gold bg-clip-text text-transparent">
                Premium quality.
              </span>
            </h1>
            <p className="text-cream/75 text-base md:text-lg mb-8 max-w-md">
              Streetwear, sneakers, accessories, and fragrance — hand-picked and authenticated for those who
              demand the real thing.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/category/new-arrivals" className="btn-primary px-7 py-3.5 text-sm">
                Shop New Arrivals
              </Link>
              <Link href="/category/all" className="btn-secondary px-7 py-3.5 text-sm">
                Explore Collections
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-cream/70">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="w-3.5 h-3.5 text-gold" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
