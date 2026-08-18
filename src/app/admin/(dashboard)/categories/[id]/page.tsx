import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "../CategoryForm";
import { updateCategory } from "../../../actions";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Modifier la catégorie</h1>
      <CategoryForm category={category} action={updateCategory.bind(null, id)} />
    </div>
  );
}
