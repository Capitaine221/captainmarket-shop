"use client";

import { useState } from "react";
import ImageUrlField from "../ImageUrlField";

type LinkProduct = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  externalUrl: string | null;
  variants: { priceCents: number; onSale: boolean; salePriceCents: number | null }[];
  images: { url: string }[];
};

export default function LinkProductForm({
  product,
  action,
}: {
  product?: LinkProduct;
  action: (formData: FormData) => void;
}) {
  const [images, setImages] = useState<string[]>(
    product?.images.length ? product.images.map((i) => i.url) : [""]
  );
  const [onSale, setOnSale] = useState(product?.variants[0]?.onSale ?? false);

  return (
    <form action={action} className="max-w-2xl space-y-6 bg-white p-6 rounded-lg border border-neutral-200">
      <div>
        <label className="block text-sm font-medium mb-1">Titre</label>
        <input
          name="title"
          defaultValue={product?.title}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={product?.description ?? ""}
          rows={4}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Prix</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product ? product.variants[0]?.priceCents / 100 : undefined}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div className="flex-1">
          <label className="flex items-center gap-2 text-sm font-medium mb-1">
            <input
              type="checkbox"
              name="onSale"
              checked={onSale}
              onChange={(e) => setOnSale(e.target.checked)}
            />
            En réduction
          </label>
          <input
            name="salePrice"
            type="number"
            step="0.01"
            min="0"
            disabled={!onSale}
            defaultValue={product?.variants[0]?.salePriceCents != null ? product.variants[0].salePriceCents / 100 : undefined}
            placeholder="Prix réduit"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 disabled:bg-neutral-100 disabled:text-neutral-400"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Statut</label>
          <select
            name="status"
            defaultValue={product?.status ?? "ACTIVE"}
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          >
            <option value="ACTIVE">Actif</option>
            <option value="DRAFT">Brouillon</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Lien externe (bouton &quot;Acheter&quot;)</label>
        <input
          name="externalUrl"
          type="url"
          defaultValue={product?.externalUrl ?? ""}
          placeholder="https://..."
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        <p className="text-xs text-neutral-500 mt-1">
          Le bouton &quot;Acheter&quot; de ce produit renverra directement vers cette page, sans passer par le
          paiement Stripe du site.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Images</label>
          <button
            type="button"
            onClick={() => setImages([...images, ""])}
            className="text-sm text-blue-600"
          >
            + Ajouter une image
          </button>
        </div>
        <div className="space-y-2">
          {images.map((url, i) => (
            <div key={i} className="flex gap-2 items-center">
              <ImageUrlField
                name="image_url"
                value={url}
                onChange={(next) => {
                  const nextImages = [...images];
                  nextImages[i] = next;
                  setImages(nextImages);
                }}
              />
              {url && (
                <img src={url} alt="" className="h-9 w-9 object-cover rounded-md border border-neutral-200 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="text-red-500 text-sm px-2 shrink-0"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" className="bg-black text-white px-5 py-2.5 rounded-md text-sm">
        Enregistrer
      </button>
    </form>
  );
}
