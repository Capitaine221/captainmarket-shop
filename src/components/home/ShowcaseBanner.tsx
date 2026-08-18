import Link from "next/link";
import Image from "next/image";

export default function ShowcaseBanner({
  eyebrow,
  title,
  description,
  buttonLabel,
  href,
  imageUrl,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  imageUrl: string | null;
  reverse?: boolean;
}) {
  return (
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-10">
      <div
        className={`grid md:grid-cols-2 gap-8 items-center card-surface overflow-hidden ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="relative aspect-[4/3] md:aspect-auto md:h-[420px]">
          {imageUrl ? (
            <Image src={imageUrl} alt={title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-ink" />
          )}
        </div>
        <div className="px-8 py-10 md:pr-16">
          <p className="text-xs uppercase tracking-[0.2em] text-gold mb-3">{eyebrow}</p>
          <h2 className="font-heading text-2xl md:text-3xl mb-4">{title}</h2>
          <p className="text-cream/60 mb-7">{description}</p>
          <Link href={href} className="btn-primary inline-block px-6 py-3 text-sm font-semibold">
            {buttonLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
