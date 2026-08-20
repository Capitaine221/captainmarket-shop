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
function triggerCatalogRebuild() {
  const hookUrl = process.env.CATALOG_BUILD_HOOK_URL;
  if (!hookUrl) return;
  fetch(hookUrl, { method: "POST" }).catch((err) => {
    console.error("Catalog rebuild trigger failed:", err);
  });
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
  revalidatePath("/");
  triggerCatalogRebuild();
}
