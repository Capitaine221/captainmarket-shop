"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatCents } from "@/lib/money";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCart();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  const total = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors du paiement.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors du paiement.");
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-8">Panier</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-neutral-500 mb-4">Ton panier est vide.</p>
          <Link href="/" className="underline">
            Continuer mes achats
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-4 border-b border-neutral-100 pb-4">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-neutral-100 relative shrink-0">
                  {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-neutral-500">{item.variantTitle}</div>
                  <div className="text-sm">{formatCents(item.priceCents)}</div>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setQuantity(item.variantId, Math.max(1, parseInt(e.target.value || "1", 10)))}
                  className="w-16 border border-neutral-300 rounded-md px-2 py-1"
                />
                <button onClick={() => removeItem(item.variantId)} className="text-red-500 text-sm">
                  Retirer
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-lg font-semibold mb-6">
            <span>Total</span>
            <span>{formatCents(total)}</span>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={checkout}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md font-medium disabled:opacity-50"
          >
            {loading ? "Redirection..." : "Passer au paiement"}
          </button>
        </>
      )}
    </div>
  );
}
