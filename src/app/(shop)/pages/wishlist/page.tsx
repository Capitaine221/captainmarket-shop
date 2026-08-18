"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlist } from "@/lib/wishlist";
import ProductCard from "@/components/ProductCard";

type CardProduct = {
  id: string;
  slug: string;
  title: string;
  vendor: string | null;
  images: { url: string }[];
  variants: { id: string; title: string; priceCents: number; inventoryQuantity: number }[];
};

export default function WishlistPage() {
  const slugs = useWishlist((s) => s.productSlugs);
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (slugs.length === 0) {
      setProducts([]);
      return;
    }
    fetch(`/api/products?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []));
  }, [mounted, slugs]);

  if (!mounted) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-14">
      <h1 className="font-heading text-2xl md:text-3xl mb-8">Wishlist</h1>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-cream/50 mb-4">Your wishlist is empty.</p>
          <Link href="/category/all" className="text-gold hover:underline text-sm">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
