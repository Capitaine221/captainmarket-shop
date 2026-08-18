"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  productSlugs: string[];
  toggle: (slug: string) => void;
  isSaved: (slug: string) => boolean;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      productSlugs: [],
      toggle: (slug) => {
        const current = get().productSlugs;
        set({
          productSlugs: current.includes(slug)
            ? current.filter((s) => s !== slug)
            : [...current, slug],
        });
      },
      isSaved: (slug) => get().productSlugs.includes(slug),
    }),
    { name: "wishlist-storage" }
  )
);
