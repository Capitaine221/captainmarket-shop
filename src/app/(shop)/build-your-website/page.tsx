import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";

export default async function BuildYourWebsitePage() {
  const packages = await prisma.websitePackage.findMany({ orderBy: { position: "asc" } });

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-14">
      <h1 className="font-heading text-2xl md:text-3xl mb-2">Build your website</h1>
      <p className="text-cream/60 text-sm mb-10">
        Pick a package below and tell us what you have in mind — we&apos;ll take it from there.
      </p>

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
