import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/money";
import { deleteProduct } from "../../actions";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { externalUrl: null },
    orderBy: { createdAt: "desc" },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, variants: true },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Produits</h1>
        <Link href="/admin/products/new" className="bg-black text-white px-4 py-2 rounded-md text-sm">
          + Nouveau produit
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Titre</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const minPrice = Math.min(...p.variants.map((v) => v.priceCents));
              const stock = p.variants.reduce((sum, v) => sum + v.inventoryQuantity, 0);
              const onSale = p.variants.some((v) => v.onSale);
              return (
                <tr key={p.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2 w-16">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0].url}
                        alt={p.title}
                        width={40}
                        height={40}
                        className="rounded object-cover w-10 h-10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-neutral-100" />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {formatCents(minPrice || 0)}
                    {onSale && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase bg-amber-100 text-amber-700">
                        Sale
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{stock}</td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:underline">
                      Modifier
                    </Link>
                    <form action={deleteProduct.bind(null, p.id)} className="inline">
                      <button className="text-red-600 hover:underline">Supprimer</button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-400">
                  Aucun produit pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
