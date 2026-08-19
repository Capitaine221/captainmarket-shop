import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [productCount, categoryCount, orderCount, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalCents: true } }),
  ]);

  const stats = [
    { label: "Produits", value: productCount, href: "/admin/products" },
    { label: "Catégories", value: categoryCount, href: "/admin/categories" },
    { label: "Commandes payées", value: orderCount, href: "/admin/orders" },
    {
      label: "Revenu total",
      value: new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(
        (revenue._sum.totalCents ?? 0) / 100
      ),
      href: "/admin/orders",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-white rounded-lg border border-neutral-200 p-5 hover:shadow-sm transition"
          >
            <div className="text-sm text-neutral-500">{s.label}</div>
            <div className="text-2xl font-semibold mt-1">{s.value}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
