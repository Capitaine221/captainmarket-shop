const REVIEWS = [
  {
    rating: 5,
    quote:
      "The Chrome Hearts tee arrived exactly as pictured, authenticated and packaged like a boutique unboxing.",
    name: "Jordan M.",
    meta: "Verified Buyer",
  },
  {
    rating: 5,
    quote: "Fastest resell checkout I've used. My sneakers were legit-checked and shipped within a day.",
    name: "Alexis R.",
    meta: "Verified Buyer",
  },
  {
    rating: 5,
    quote:
      "CaptainMarket feels like shopping a private showroom. Every fragrance I've ordered has been 100% authentic.",
    name: "Devon K.",
    meta: "Verified Buyer",
  },
];

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gold" aria-hidden="true">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.2l7.1-.6L12 2z" />
    </svg>
  );
}

export default function Reviews() {
  return (
    <section className="bg-ink-2 border-y border-line mt-10">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 md:py-24 text-center">
        <p className="eyebrow mb-3">Reviews</p>
        <h2 className="font-heading text-3xl md:text-4xl mb-3">What Our Clients Say</h2>
        <p className="text-muted mb-12">Trusted by resellers and collectors worldwide</p>
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 text-left">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="card-surface card-hover p-7 flex flex-col">
              <div className="flex gap-1 mb-4" role="img" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} />
                ))}
              </div>
              <blockquote className="text-cream/90 text-[15px] leading-relaxed mb-6 flex-1">
                &ldquo;{r.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-2 to-gold text-[#1a1400] flex items-center justify-center text-sm font-bold">
                  {r.name.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{r.name}</div>
                  <div className="text-xs text-ok flex items-center gap-1">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="w-3 h-3" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {r.meta}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
