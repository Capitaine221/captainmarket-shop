import { getStore } from "@netlify/blobs";

export function checkPassword(req) {
  const expected = process.env.CATALOG_DASHBOARD_PASSWORD;
  if (!expected) return false; // dashboard disabled until the password is configured
  const headerValue = req.headers.get("x-catalog-password");
  if (headerValue !== null) return headerValue === expected;
  // <img> tags can't send custom headers, so catalog-image also accepts ?pw=... — the
  // password is only ever this dashboard's own shared secret, not a real user credential.
  const url = new URL(req.url);
  return url.searchParams.get("pw") === expected;
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: "Mot de passe incorrect ou dashboard non configuré." }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

export function productsStore() {
  return getStore("catalog-extras");
}

export function imagesStore() {
  return getStore("catalog-extra-images");
}

export async function listExtraProducts() {
  const store = productsStore();
  const data = await store.get("products.json", { type: "json" });
  return Array.isArray(data) ? data : [];
}

export async function saveExtraProducts(products) {
  const store = productsStore();
  await store.setJSON("products.json", products);
}

export async function triggerRebuild() {
  const hookUrl = process.env.SELF_BUILD_HOOK_URL;
  if (!hookUrl) return;
  try {
    await fetch(hookUrl, { method: "POST" });
  } catch (err) {
    console.error("Rebuild trigger failed:", err);
  }
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
