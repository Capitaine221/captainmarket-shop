"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export default function CheckoutSuccessPage() {
  const clear = useCart((s) => s.clear);
  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-3">Merci pour ta commande !</h1>
      <p className="text-neutral-500 mb-8">
        Ton paiement a été confirmé. Tu recevras bientôt un courriel de confirmation.
      </p>
      <Link href="/" className="underline">
        Retour à la boutique
      </Link>
    </div>
  );
}
