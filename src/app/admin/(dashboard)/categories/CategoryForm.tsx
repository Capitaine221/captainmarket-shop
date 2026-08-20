"use client";

import { useState } from "react";
import ImageUrlField from "../ImageUrlField";

type Category = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
};

export default function CategoryForm({
  category,
  action,
}: {
  category?: Category;
  action: (formData: FormData) => void;
}) {
  const [imageUrl, setImageUrl] = useState(category?.imageUrl ?? "");

  return (
    <form action={action} className="max-w-lg space-y-4 bg-white p-6 rounded-lg border border-neutral-200">
      <div>
        <label className="block text-sm font-medium mb-1">Nom</label>
        <input
          name="name"
          defaultValue={category?.name}
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          defaultValue={category?.description ?? ""}
          rows={3}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Image</label>
        <ImageUrlField
          name="imageUrl"
          value={imageUrl}
          onChange={setImageUrl}
          className="w-full rounded-md border border-neutral-300 px-3 py-2"
        />
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mt-2 h-20 w-20 object-cover rounded-md border border-neutral-200" />
        )}
      </div>
      <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm">
        Enregistrer
      </button>
    </form>
  );
}
