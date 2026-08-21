"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/money";
import { createAdminSession, destroyAdminSession } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { safeCompare } from "@/lib/safeCompare";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Pings the separate "catalogue de secours" Netlify site's build hook so it regenerates
// itself from Turso whenever a product/category changes — no manual redeploy needed.
// No-ops until CATALOG_BUILD_HOOK_URL is set (see catalog-site/netlify.toml for setup).
function triggerNetlifyCatalogRebuild() {
  const hookUrl = process.env.CATALOG_BUILD_HOOK_URL;
  if (!hookUrl) return;
  fetch(hookUrl, { method: "POST" }).catch((err) => {
    console.error("Netlify catalog rebuild trigger failed:", err);
  });
}

// Fires the GitHub Actions workflow that rebuilds the GitHub Pages mirror of the catalog
// (.github/workflows/deploy-catalog-pages.yml) — same idea, different host. No-ops until
// GITHUB_WORKFLOW_TOKEN is set (a PAT with the "workflow" scope on the shop repo).
function triggerGithubPagesCatalogRebuild() {
  const token = process.env.GITHUB_WORKFLOW_TOKEN;
  const repo = process.env.GITHUB_CATALOG_REPO ?? "Capitaine221/captainmarket-shop";
  if (!token) return;
  fetch(`https://api.github.com/repos/${repo}/actions/workflows/deploy-catalog-pages.yml/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: "main" }),
  }).then(async (res) => {
    if (!res.ok) console.error("GitHub Pages catalog rebuild trigger failed:", res.status, await res.text());
  }).catch((err) => {
    console.error("GitHub Pages catalog rebuild trigger failed:", err);
  });
}

function triggerCatalogRebuild() {
  triggerNetlifyCatalogRebuild();
  triggerGithubPagesCatalogRebuild();
}

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const ip = await getClientIp();
  const { allowed, retryAfterMs } = checkRateLimit(`login:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60_000);
    return { error: `Trop de tentatives. Réessaie dans ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  const password = String(formData.get("password") ?? "");
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected || !safeCompare(password, expected)) {
    return { error: "Mot de passe incorrect." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}

// ---------- Categories ----------

export async function createCategory(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Le nom est requis.");
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  let slug = slugify(name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.category.create({ data: { name, slug, description, imageUrl } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  triggerCatalogRebuild();
  redirect("/admin/categories");
}

export async function updateCategory(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  if (!name) throw new Error("Le nom est requis.");

  await prisma.category.update({ where: { id }, data: { name, description, imageUrl } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  triggerCatalogRebuild();
  redirect("/admin/categories");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
  triggerCatalogRebuild();
}

// ---------- Products ----------

type VariantInput = {
  title: string;
  priceCents: number;
  inventoryQuantity: number;
  sku?: string;
  option1Value?: string;
  option2Value?: string;
  imageUrl?: string;
};

function parseVariantsFromForm(formData: FormData): VariantInput[] {
  const opt1Values = formData.getAll("variant_option1") as string[];
  const opt2Values = formData.getAll("variant_option2") as string[];
  const prices = formData.getAll("variant_price") as string[];
  const stocks = formData.getAll("variant_stock") as string[];
  const skus = formData.getAll("variant_sku") as string[];
  const imageUrls = formData.getAll("variant_image") as string[];

  const variants: VariantInput[] = [];
  for (let i = 0; i < prices.length; i++) {
    const option1Value = (opt1Values[i] ?? "").trim() || undefined;
    const option2Value = (opt2Values[i] ?? "").trim() || undefined;
    const title = [option1Value, option2Value].filter(Boolean).join(" / ") || "Default";
    const priceCents = Math.round(parseFloat(prices[i] || "0") * 100);
    const inventoryQuantity = parseInt(stocks[i] || "0", 10) || 0;
    const sku = (skus[i] ?? "").trim() || undefined;
    const imageUrl = (imageUrls[i] ?? "").trim() || undefined;
    variants.push({ title, priceCents, inventoryQuantity, sku, option1Value, option2Value, imageUrl });
  }
  if (variants.length === 0) {
    variants.push({ title: "Default", priceCents: 0, inventoryQuantity: 0 });
  }
  return variants;
}

function parseImagesFromForm(formData: FormData): string[] {
  return (formData.getAll("image_url") as string[]).map((u) => u.trim()).filter(Boolean);
}

export async function createProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Le titre est requis.");
  const description = String(formData.get("description") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "ACTIVE");
  const categoryIds = formData.getAll("categoryIds") as string[];
  const option1Name = String(formData.get("option1Name") ?? "").trim() || null;
  const option2Name = String(formData.get("option2Name") ?? "").trim() || null;

  let slug = slugify(title);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const variants = parseVariantsFromForm(formData);
  const images = parseImagesFromForm(formData);

  await prisma.product.create({
    data: {
      title,
      slug,
      description,
      status,
      option1Name,
      option2Name,
      variants: { create: variants },
      images: { create: images.map((url, position) => ({ url, position })) },
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/");
  triggerCatalogRebuild();
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Le titre est requis.");
  const description = String(formData.get("description") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "ACTIVE");
  const categoryIds = formData.getAll("categoryIds") as string[];
  const option1Name = String(formData.get("option1Name") ?? "").trim() || null;
  const option2Name = String(formData.get("option2Name") ?? "").trim() || null;

  const variants = parseVariantsFromForm(formData);
  const images = parseImagesFromForm(formData);

  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productCategory.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        status,
        option1Name,
        option2Name,
        variants: { create: variants },
        images: { create: images.map((url, position) => ({ url, position })) },
        categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      },
    }),
  ]);

  revalidatePath("/admin/products");
  revalidatePath("/");
  triggerCatalogRebuild();
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/admin/links");
  revalidatePath("/");
  triggerCatalogRebuild();
}

// ---------- Link products (digital products with an external "Acheter" link) ----------

async function ensureLinksCategory() {
  return prisma.category.upsert({
    where: { slug: "links" },
    update: {},
    create: { name: "Links", slug: "links" },
  });
}

export async function createLinkProduct(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Le titre est requis.");
  const description = String(formData.get("description") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "ACTIVE");
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  if (!externalUrl) throw new Error("Le lien externe est requis.");
  const priceCents = Math.round(parseFloat(String(formData.get("price") ?? "0")) * 100);
  const images = parseImagesFromForm(formData);

  let slug = slugify(title);
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const linksCategory = await ensureLinksCategory();

  await prisma.product.create({
    data: {
      title,
      slug,
      description,
      status,
      externalUrl,
      variants: { create: [{ title: "Default", priceCents, inventoryQuantity: 999999 }] },
      images: { create: images.map((url, position) => ({ url, position })) },
      categories: { create: [{ categoryId: linksCategory.id }] },
    },
  });

  revalidatePath("/admin/links");
  revalidatePath("/");
  triggerCatalogRebuild();
  redirect("/admin/links");
}

export async function updateLinkProduct(id: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Le titre est requis.");
  const description = String(formData.get("description") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "ACTIVE");
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  if (!externalUrl) throw new Error("Le lien externe est requis.");
  const priceCents = Math.round(parseFloat(String(formData.get("price") ?? "0")) * 100);
  const images = parseImagesFromForm(formData);

  const linksCategory = await ensureLinksCategory();

  await prisma.$transaction([
    prisma.productVariant.deleteMany({ where: { productId: id } }),
    prisma.productImage.deleteMany({ where: { productId: id } }),
    prisma.productCategory.deleteMany({ where: { productId: id } }),
    prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        status,
        externalUrl,
        variants: { create: [{ title: "Default", priceCents, inventoryQuantity: 999999 }] },
        images: { create: images.map((url, position) => ({ url, position })) },
        categories: { create: [{ categoryId: linksCategory.id }] },
      },
    }),
  ]);

  revalidatePath("/admin/links");
  revalidatePath("/");
  triggerCatalogRebuild();
  redirect("/admin/links");
}

// ---------- Website packages ("Build your website") ----------

export async function createWebsitePackage(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Le nom est requis.");
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceCents = Math.round(parseFloat(String(formData.get("price") ?? "0")) * 100);

  const last = await prisma.websitePackage.findFirst({ orderBy: { position: "desc" } });
  const position = (last?.position ?? -1) + 1;

  await prisma.websitePackage.create({ data: { name, description, priceCents, position } });

  revalidatePath("/admin/build-your-website");
  revalidatePath("/build-your-website");
  redirect("/admin/build-your-website");
}

export async function updateWebsitePackage(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Le nom est requis.");
  const description = String(formData.get("description") ?? "").trim() || null;
  const priceCents = Math.round(parseFloat(String(formData.get("price") ?? "0")) * 100);

  await prisma.websitePackage.update({ where: { id }, data: { name, description, priceCents } });

  revalidatePath("/admin/build-your-website");
  revalidatePath("/build-your-website");
  redirect("/admin/build-your-website");
}

export async function deleteWebsitePackage(id: string) {
  await prisma.websitePackage.delete({ where: { id } });
  revalidatePath("/admin/build-your-website");
  revalidatePath("/build-your-website");
}

export async function moveWebsitePackage(id: string, direction: "up" | "down") {
  const packages = await prisma.websitePackage.findMany({ orderBy: { position: "asc" } });
  const index = packages.findIndex((p) => p.id === id);
  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || targetIndex < 0 || targetIndex >= packages.length) return;

  const current = packages[index];
  const target = packages[targetIndex];

  await prisma.$transaction([
    prisma.websitePackage.update({ where: { id: current.id }, data: { position: target.position } }),
    prisma.websitePackage.update({ where: { id: target.id }, data: { position: current.position } }),
  ]);

  revalidatePath("/admin/build-your-website");
  revalidatePath("/build-your-website");
}
