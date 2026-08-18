"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart";
import { formatCents } from "@/lib/money";

export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, removeItem, setQuantity } = useCart();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  if (!mounted) return null;

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

  return (
    <div
      className={`fixed inset-0 z-50 ${drawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
    >
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Panier"
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-ink-3 border-l border-white/10 flex flex-col transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="font-heading text-lg">Panier</h2>
          <button onClick={closeDrawer} aria-label="Fermer" className="text-cream/70 hover:text-cream text-xl leading-none">
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <p className="text-cream/60">Ton panier est vide</p>
            <Link href="/category/all" onClick={closeDrawer} className="btn-primary px-6 py-3 text-sm font-medium">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="w-20 h-20 rounded-md overflow-hidden bg-ink-2 relative shrink-0">
                    {item.imageUrl && <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.title}</div>
                    <div className="text-xs text-cream/50">{item.variantTitle}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-white/15 rounded-md">
                        <button
                          className="w-7 h-7 text-sm"
                          onClick={() => setQuantity(item.variantId, Math.max(1, item.quantity - 1))}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          className="w-7 h-7 text-sm"
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm">{formatCents(item.priceCents * item.quantity)}</span>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      className="text-xs text-cream/40 hover:text-cream mt-2"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-5 border-t border-white/10 space-y-3">
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <div className="flex items-center justify-between font-heading text-base">
                <span>Estimated total</span>
                <span>{formatCents(total)}</span>
              </div>
              <button
                onClick={checkout}
                disabled={loading}
                className="btn-primary w-full py-3.5 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? "Redirection..." : "Check out"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
