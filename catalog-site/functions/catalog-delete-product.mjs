import { checkPassword, unauthorized, imagesStore, listExtraProducts, saveExtraProducts, triggerRebuild, json } from "./_shared.mjs";

export default async (req) => {
  if (!checkPassword(req)) return unauthorized();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Corps de requête invalide." }, 400);
  }

  const id = String(body.id || "");
  if (!id) return json({ error: "id requis." }, 400);

  const extras = await listExtraProducts();
  const target = extras.find((p) => p.id === id);
  if (!target) return json({ error: "Produit introuvable." }, 404);

  await imagesStore().delete(target.imageKey);
  await saveExtraProducts(extras.filter((p) => p.id !== id));
  await triggerRebuild();

  return json({ ok: true });
};

export const config = { path: "/.netlify/functions/catalog-delete-product" };
