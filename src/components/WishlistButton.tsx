"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist";

export default function WishlistButton({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const isSavedRaw = useWishlist((s) => s.isSaved(slug));
  const toggle = useWishlist((s) => s.toggle);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isSaved = mounted && isSavedRaw;

  return (
    <button
      type="button"
      aria-label={isSaved ? "Retirer de la wishlist" : "Ajouter à la wishlist"}
      aria-pressed={isSaved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={`flex items-center justify-center rounded-full bg-ink/70 backdrop-blur w-8 h-8 hover:bg-ink transition-colors ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        stroke="currentColor"
        strokeWidth="1.6"
        fill={isSaved ? "currentColor" : "none"}
        style={{ color: isSaved ? "var(--color-gold)" : "var(--color-cream)" }}
      >
        <path d="M12 21s-7.5-4.6-10-9.1C.4 8.4 2 4.5 5.8 4c2.1-.3 4 .8 6.2 3 2.2-2.2 4.1-3.3 6.2-3 3.8.5 5.4 4.4 3.8 7.9C19.5 16.4 12 21 12 21z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
