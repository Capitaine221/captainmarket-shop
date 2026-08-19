import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteCategory } from "../../actions";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Catégories</h1>
        <Link href="/admin/categories/new" className="bg-black text-white px-4 py-2 rounded-md text-sm">
          + Nouvelle catégorie
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Produits</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-neutral-500">{c.slug}</td>
                <td className="px-4 py-3">{c._count.products}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link href={`/admin/categories/${c.id}`} className="text-blue-600 hover:underline">
                    Modifier
                  </Link>
                  <form action={deleteCategory.bind(null, c.id)} className="inline">
                    <button className="text-red-600 hover:underline">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-400">
                  Aucune catégorie pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
