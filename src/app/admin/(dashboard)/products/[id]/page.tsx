import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "../ProductForm";
import { updateProduct } from "../../../actions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        images: { orderBy: { position: "asc" } },
        categories: { select: { categoryId: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Modifier le produit</h1>
      <ProductForm product={product} categories={categories} action={updateProduct.bind(null, id)} />
    </div>
  );
}
