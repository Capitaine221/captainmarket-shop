"use client";

import { useState } from "react";

type WebsitePackage = {
  id: string;
  name: string;
  description: string | null;
  priceMinCents: number;
  priceMaxCents: number | null;
  onSale: boolean;
  salePriceCents: number | null;
};

export default function PackageForm({
  pkg,
  action,
}: {
  pkg?: WebsitePackage;
  action: (formData: FormData) => void;
}) {
  const [onSale, setOnSale] = useState(pkg?.onSale ?? false);

  return (
    <form action={action} className="max-w-lg space-y-4 bg-white p-6 rounded-lg border border-neutral-200">
      <div>
        <label className="block text-sm font-medium mb-1">Nom du forfait</label>
        <input
          name="name"
          defaultValue={pkg?.name}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prix minimum</label>
          <input
            name="priceMin"
            type="number"
            step="0.01"
            min="0"
            defaultValue={pkg ? pkg.priceMinCents / 100 : undefined}
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Prix maximum (optionnel)</label>
          <input
            name="priceMax"
            type="number"
            step="0.01"
            min="0"
            defaultValue={pkg?.priceMaxCents != null ? pkg.priceMaxCents / 100 : undefined}
            placeholder="Laisser vide pour un prix fixe"
            className="w-full rounded-md border border-neutral-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-1">
          <input type="checkbox" name="onSale" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
          En réduction
        </label>
        <input
          name="salePrice"
          type="number"
          step="0.01"
          min="0"
          disabled={!onSale}
          defaultValue={pkg?.salePriceCents != null ? pkg.salePriceCents / 100 : undefined}
          placeholder="Prix réduit"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 disabled:bg-neutral-100 disabled:text-neutral-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={pkg?.description ?? ""}
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>

      <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm">
        Enregistrer
      </button>
    </form>
  );
}
