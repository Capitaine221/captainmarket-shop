"use client";

import { useState, type ChangeEvent } from "react";

export default function ImageUrlField({
  name,
  value,
  onChange,
  placeholder = "https://...",
  className = "",
}: {
  name?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'upload.");
      onChange(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className || "flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"}
      />
      <label className="shrink-0 flex items-center text-xs text-blue-600 cursor-pointer px-3 border border-neutral-300 rounded-md hover:bg-neutral-50">
        {uploading ? "..." : "Choisir"}
        <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}
