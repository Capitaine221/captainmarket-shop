import Link from "next/link";
import { logoutAction } from "../actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="flex">
        <aside className="w-56 shrink-0 min-h-screen bg-neutral-950 text-white p-4 flex flex-col">
          <div className="text-lg font-bold mb-6">CaptainMarket Admin</div>
          <nav className="flex flex-col gap-1 text-sm flex-1">
            <Link href="/admin" className="px-3 py-2 rounded hover:bg-neutral-800">
              Tableau de bord
            </Link>
            <Link href="/admin/products" className="px-3 py-2 rounded hover:bg-neutral-800">
              Produits
            </Link>
            <Link href="/admin/links" className="px-3 py-2 rounded hover:bg-neutral-800">
              Links
            </Link>
            <Link href="/admin/build-your-website" className="px-3 py-2 rounded hover:bg-neutral-800">
              Buy your website
            </Link>
            <Link href="/admin/categories" className="px-3 py-2 rounded hover:bg-neutral-800">
              Catégories
            </Link>
            <Link href="/admin/orders" className="px-3 py-2 rounded hover:bg-neutral-800">
              Commandes
            </Link>
            <Link href="/" className="px-3 py-2 rounded hover:bg-neutral-800 mt-4 text-neutral-400">
              Voir la boutique
            </Link>
          </nav>
          <form action={logoutAction}>
            <button className="w-full text-left px-3 py-2 rounded hover:bg-neutral-800 text-neutral-400 text-sm">
              Déconnexion
            </button>
          </form>
        </aside>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
