import { checkPassword, unauthorized, imagesStore, listExtraProducts, saveExtraProducts, triggerRebuild, json } from "./_shared.mjs";

function extFromFile(file) {
  const type = file.type || "";
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  return "jpg";
}

export default async (req) => {
  if (!checkPassword(req)) return unauthorized();
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let form;
  try {
    form = await req.formData();
  } catch {
    return json({ error: "Formulaire invalide." }, 400);
  }

  const title = String(form.get("title") || "").trim();
  const categorySlug = String(form.get("categorySlug") || "").trim();
  const categoryLabel = String(form.get("categoryLabel") || "").trim();
  const file = form.get("image");

  if (!title) return json({ error: "Le titre est requis." }, 400);
  if (!categorySlug) return json({ error: "La catégorie est requise." }, 400);
  if (!(file instanceof File) || file.size === 0) return json({ error: "Une image est requise." }, 400);
  if (file.size > 8 * 1024 * 1024) return json({ error: "Image trop lourde (max 8 Mo)." }, 400);

  const id = `extra-${crypto.randomUUID()}`;
  const ext = extFromFile(file);
  const imageKey = `${id}.${ext}`;

  const buf = new Uint8Array(await file.arrayBuffer());
  await imagesStore().set(imageKey, buf);

  const extras = await listExtraProducts();
  extras.push({
    id,
    title,
    categorySlug,
    categoryLabel,
    imageKey,
    createdAt: new Date().toISOString(),
  });
  await saveExtraProducts(extras);

  await triggerRebuild();

  return json({ ok: true, id });
};

export const config = { path: "/.netlify/functions/catalog-add-product" };
