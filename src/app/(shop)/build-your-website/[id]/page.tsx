import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { priceDisplay } from "@/lib/money";
import ContactForm from "./ContactForm";

export default async function WebsitePackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = await prisma.websitePackage.findUnique({ where: { id } });
  if (!pkg) notFound();

  const { original, sale } = priceDisplay(pkg.priceMinCents, pkg.priceMaxCents, pkg.onSale, pkg.salePriceCents);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-14">
      <h1 className="font-heading text-2xl md:text-3xl mb-2">{pkg.name}</h1>
      <p className="text-xl font-heading mb-4 flex items-center gap-2">
        {sale ? (
          <>
            <span className="text-cream/40 line-through">{original}</span>
            <span className="text-gold">{sale}</span>
            <span className="bg-gold text-ink text-xs uppercase tracking-wide px-2 py-1 rounded font-semibold">
              Sale
            </span>
          </>
        ) : (
          <span className="text-gold">{original}</span>
        )}
      </p>
      {pkg.description && <p className="text-cream/70 mb-10 whitespace-pre-line">{pkg.description}</p>}

      <div className="border-t border-white/10 pt-8">
        <ContactForm packageId={pkg.id} />
      </div>
    </div>
  );
}
