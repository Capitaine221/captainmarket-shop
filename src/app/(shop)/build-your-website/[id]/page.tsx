import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import ContactForm from "./ContactForm";

export default async function WebsitePackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = await prisma.websitePackage.findUnique({ where: { id } });
  if (!pkg) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-14">
      <h1 className="font-heading text-2xl md:text-3xl mb-2">{pkg.name}</h1>
      <p className="text-xl text-gold font-heading mb-4">{formatCents(pkg.priceCents)}</p>
      {pkg.description && <p className="text-cream/70 mb-10 whitespace-pre-line">{pkg.description}</p>}

      <div className="border-t border-white/10 pt-8">
        <ContactForm packageId={pkg.id} />
      </div>
    </div>
  );
}
