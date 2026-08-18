"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistIcon() {
  const count = useWishlist((s) => s.productSlugs.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Link
      href="/pages/wishlist"
      aria-label="Wishlist"
      className="relative flex items-center justify-center w-9 h-9 text-cream hover:text-gold transition-colors"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 21s-7.5-4.6-10-9.1C.4 8.4 2 4.5 5.8 4c2.1-.3 4 .8 6.2 3 2.2-2.2 4.1-3.3 6.2-3 3.8.5 5.4 4.4 3.8 7.9C19.5 16.4 12 21 12 21z" strokeLinejoin="round" />
      </svg>
      {mounted && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-gold text-ink text-[10px] font-semibold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
          {count}
        </span>
      )}
    </Link>
  );
}
