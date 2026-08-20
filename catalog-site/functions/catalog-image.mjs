import { checkPassword, unauthorized, imagesStore } from "./_shared.mjs";

const CONTENT_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export default async (req) => {
  if (!checkPassword(req)) return unauthorized();

  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  if (!key) return new Response("Missing key", { status: 400 });

  const bytes = await imagesStore().get(key, { type: "arrayBuffer" });
  if (!bytes) return new Response("Not found", { status: 404 });

  const ext = key.split(".").pop();
  return new Response(bytes, {
    headers: { "content-type": CONTENT_TYPES[ext] || "application/octet-stream" },
  });
};

export const config = { path: "/.netlify/functions/catalog-image" };
