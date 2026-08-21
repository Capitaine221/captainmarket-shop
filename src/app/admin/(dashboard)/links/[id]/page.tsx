import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LinkProductForm from "../LinkProductForm";
import { updateLinkProduct } from "../../../actions";

export default async function EditLinkProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!product || !product.externalUrl) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Modifier le lien</h1>
      <LinkProductForm product={product} action={updateLinkProduct.bind(null, id)} />
    </div>
  );
}
