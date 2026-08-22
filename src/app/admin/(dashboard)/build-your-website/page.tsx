import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPriceRange } from "@/lib/money";
import { deleteWebsitePackage, moveWebsitePackage } from "../../actions";

export const dynamic = "force-dynamic";

export default async function BuildYourWebsitePage() {
  const packages = await prisma.websitePackage.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Buy your website</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Forfaits affichés sur la page publique &quot;Buy your website&quot;, accessible depuis le menu principal.
          </p>
        </div>
        <Link href="/admin/build-your-website/new" className="bg-black text-white px-4 py-2 rounded-md text-sm">
          + Nouveau forfait
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500 text-left">
            <tr>
              <th className="px-4 py-3"></th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p, i) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="px-4 py-3 w-20">
                  <div className="flex gap-1">
                    <form action={moveWebsitePackage.bind(null, p.id, "up")}>
                      <button disabled={i === 0} className="text-neutral-500 disabled:opacity-20 px-1">
                        ↑
                      </button>
                    </form>
                    <form action={moveWebsitePackage.bind(null, p.id, "down")}>
                      <button disabled={i === packages.length - 1} className="text-neutral-500 disabled:opacity-20 px-1">
                        ↓
                      </button>
                    </form>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{formatPriceRange(p.priceMinCents, p.priceMaxCents)}</td>
                <td className="px-4 py-3 max-w-[320px] truncate text-neutral-500">{p.description}</td>
                <td className="px-4 py-3 text-right space-x-3">
                  <Link href={`/admin/build-your-website/${p.id}`} className="text-blue-600 hover:underline">
                    Modifier
                  </Link>
                  <form action={deleteWebsitePackage.bind(null, p.id)} className="inline">
                    <button className="text-red-600 hover:underline">Supprimer</button>
                  </form>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  Aucun forfait pour l&apos;instant.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
