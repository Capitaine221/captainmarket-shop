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
    <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 md:py-8">
      <div
        className={`grid md:grid-cols-2 items-stretch card-surface overflow-hidden ${
          reverse ? "md:[&>*:first-child]:order-2" : ""
        }`}
      >
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[440px]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-card-2 to-card" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-card/40" />
        </div>
        <div className="flex flex-col justify-center px-7 py-10 md:px-14">
          <p className="eyebrow mb-4">{eyebrow}</p>
          <h2 className="font-heading text-3xl md:text-4xl leading-tight mb-4">{title}</h2>
          <p className="text-muted text-base mb-8 max-w-md">{description}</p>
          <div>
            <Link href={href} className="btn-primary px-7 py-3.5 text-sm">
              {buttonLabel} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
