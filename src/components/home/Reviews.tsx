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
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-gold">
      <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.2l7.1-.6L12 2z" />
    </svg>
  );
}

export default function Reviews() {
  return (
    <section className="bg-ink-2">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-20 text-center">
        <h2 className="font-heading text-2xl md:text-3xl mb-2">What Our Clients Say</h2>
        <p className="text-cream/60 mb-12">Trusted by resellers and collectors worldwide</p>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {REVIEWS.map((r) => (
            <div key={r.name} className="card-surface p-7">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} />
                ))}
              </div>
              <p className="text-cream/80 text-sm mb-6">&ldquo;{r.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold text-ink flex items-center justify-center text-sm font-semibold">
                  {r.name.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-cream/50">{r.meta}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
