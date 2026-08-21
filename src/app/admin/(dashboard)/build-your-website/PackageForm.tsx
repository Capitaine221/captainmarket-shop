"use client";

type WebsitePackage = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
};

export default function PackageForm({
  pkg,
  action,
}: {
  pkg?: WebsitePackage;
  action: (formData: FormData) => void;
}) {
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

      <div>
        <label className="block text-sm font-medium mb-1">Prix</label>
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={pkg ? pkg.priceCents / 100 : undefined}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
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
