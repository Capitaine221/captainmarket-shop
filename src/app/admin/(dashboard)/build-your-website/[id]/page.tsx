import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PackageForm from "../PackageForm";
import { updateWebsitePackage } from "../../../actions";

export default async function EditWebsitePackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = await prisma.websitePackage.findUnique({ where: { id } });
  if (!pkg) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Modifier le forfait</h1>
      <PackageForm pkg={pkg} action={updateWebsitePackage.bind(null, id)} />
    </div>
  );
}
