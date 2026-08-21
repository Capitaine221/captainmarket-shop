import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

export default async function BuildYourWebsitePage() {
  const packages = await prisma.websitePackage.findMany({ orderBy: { position: "asc" } });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-14">
      <h1 className="font-heading text-3xl md:text-4xl mb-6">Your Vision. Your Website.</h1>
      <div className="text-cream/70 text-sm md:text-base leading-relaxed space-y-4 mb-12 max-w-2xl">
        <p>Create a professional, modern, and high-performing website designed around your business.</p>
        <p>
          We focus on beautiful design, smooth user experience, and real results, while listening closely to your
          needs and expectations. Every detail is tailored to your brand so your website looks professional, builds
          trust, and turns visitors into customers.
        </p>
        <p className="text-cream font-medium">Your brand deserves a website that stands out.</p>
      </div>

      {packages.length === 0 ? (
        <p className="text-cream/40 text-sm py-16 text-center">No packages available yet.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {packages.map((pkg) => (
            <Link
              key={pkg.id}
              href={`/build-your-website/${pkg.id}`}
              className="block bg-ink-3 rounded-3xl px-8 py-6 hover:bg-ink-2 transition-colors"
            >
              <p className="font-heading font-bold text-xl md:text-2xl mb-1">
                {pkg.name}: {formatCents(pkg.priceCents)}
              </p>
              {pkg.description && <p className="font-medium text-sm md:text-base text-cream/70">{pkg.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
