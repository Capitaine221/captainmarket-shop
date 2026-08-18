"use client";

import { useState } from "react";

type Variant = {
  title: string;
  priceCents: number;
  inventoryQuantity: number;
  sku?: string | null;
  option1Value?: string | null;
  option2Value?: string | null;
  imageUrl?: string | null;
};
type ProductImage = { url: string };
type Category = { id: string; name: string };

type Product = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  option1Name?: string | null;
  option2Name?: string | null;
  variants: Variant[];
  images: ProductImage[];
  categories: { categoryId: string }[];
};

export default function ProductForm({
  product,
  categories,
  action,
}: {
  product?: Product;
  categories: Category[];
  action: (formData: FormData) => void;
}) {
  const [option1Name, setOption1Name] = useState(product?.option1Name ?? "");
  const [option2Name, setOption2Name] = useState(product?.option2Name ?? "");
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants.length
      ? product.variants.map((v) => ({ ...v }))
      : [{ title: "Default", priceCents: 0, inventoryQuantity: 0, sku: "", option1Value: "", option2Value: "", imageUrl: "" }]
  );
  const [images, setImages] = useState<string[]>(
    product?.images.length ? product.images.map((i) => i.url) : [""]
  );
  const selectedCategoryIds = new Set(product?.categories.map((c) => c.categoryId));

  return (
    <form action={action} className="max-w-3xl space-y-6 bg-white p-6 rounded-lg border border-neutral-200">
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

      <div>
        <label className="block text-sm font-medium mb-1">Statut</label>
        <select
          name="status"
          defaultValue={product?.status ?? "ACTIVE"}
          className="rounded-md border border-neutral-300 px-3 py-2"
        >
          <option value="ACTIVE">Actif</option>
          <option value="DRAFT">Brouillon</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Catégories</label>
        <div className="flex flex-wrap gap-3">
          {categories.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm border border-neutral-200 rounded-md px-3 py-1.5">
              <input
                type="checkbox"
                name="categoryIds"
                value={c.id}
                defaultChecked={selectedCategoryIds.has(c.id)}
              />
              {c.name}
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-neutral-400">Crée d&apos;abord une catégorie.</p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Images (URLs)</label>
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
            <div key={i} className="flex gap-2">
              <input
                name="image_url"
                value={url}
                onChange={(e) => {
                  const next = [...images];
                  next[i] = e.target.value;
                  setImages(next);
                }}
                placeholder="https://..."
                className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="text-red-500 text-sm px-2"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Options de variantes</label>
        <p className="text-xs text-neutral-500 mb-2">
          Nomme tes options si le produit a des variantes (ex: Couleur, Taille). Laisse vide si le produit
          n&apos;a qu&apos;une seule version.
        </p>
        <div className="flex gap-3">
          <input
            name="option1Name"
            value={option1Name}
            onChange={(e) => setOption1Name(e.target.value)}
            placeholder="Option 1 (ex: Couleur)"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            name="option2Name"
            value={option2Name}
            onChange={(e) => setOption2Name(e.target.value)}
            placeholder="Option 2 (ex: Taille)"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Variantes</label>
          <button
            type="button"
            onClick={() =>
              setVariants([
                ...variants,
                { title: "", priceCents: 0, inventoryQuantity: 0, sku: "", option1Value: "", option2Value: "", imageUrl: "" },
              ])
            }
            className="text-sm text-blue-600"
          >
            + Ajouter une variante
          </button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_90px_80px_1fr_1fr_auto] gap-2 text-xs text-neutral-400 px-1">
            <span>{option1Name || "Option 1"}</span>
            <span>{option2Name || "Option 2"}</span>
            <span>Prix</span>
            <span>Stock</span>
            <span>SKU</span>
            <span>Image URL</span>
            <span />
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_90px_80px_1fr_1fr_auto] gap-2 items-center">
              <input
                name="variant_option1"
                value={v.option1Value ?? ""}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], option1Value: e.target.value };
                  setVariants(next);
                }}
                placeholder="Ex: Noir"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                name="variant_option2"
                value={v.option2Value ?? ""}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], option2Value: e.target.value };
                  setVariants(next);
                }}
                placeholder="Ex: Medium"
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                name="variant_price"
                type="number"
                step="0.01"
                min="0"
                value={v.priceCents / 100}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], priceCents: Math.round(parseFloat(e.target.value || "0") * 100) };
                  setVariants(next);
                }}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                name="variant_stock"
                type="number"
                min="0"
                value={v.inventoryQuantity}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], inventoryQuantity: parseInt(e.target.value || "0", 10) };
                  setVariants(next);
                }}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                name="variant_sku"
                value={v.sku ?? ""}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], sku: e.target.value };
                  setVariants(next);
                }}
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <input
                name="variant_image"
                value={v.imageUrl ?? ""}
                onChange={(e) => {
                  const next = [...variants];
                  next[i] = { ...next[i], imageUrl: e.target.value };
                  setVariants(next);
                }}
                placeholder="https://..."
                className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                className="text-red-500 text-sm"
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
