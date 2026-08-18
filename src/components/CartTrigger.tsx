"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export default function CartTrigger() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const openDrawer = useCart((s) => s.openDrawer);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={openDrawer}
      aria-label="Panier"
      className="relative flex items-center justify-center w-9 h-9 text-cream hover:text-gold transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
        <path d="M6 6L4.5 3H2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9.5" cy="19.5" r="1.25" />
        <circle cx="17.5" cy="19.5" r="1.25" />
      </svg>
      {mounted && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-gold text-ink text-[10px] font-semibold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </button>
  );
}
