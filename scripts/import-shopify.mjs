import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const SCRATCH = "C:\\Users\\LENOVO\\AppData\\Local\\Temp\\claude\\C--Users-LENOVO-OneDrive-Desktop-claude-code\\c80860be-63e6-483f-93ab-270aec4c89c8\\scratchpad";
const PRODUCTS_FILE = path.join(SCRATCH, "shopify_products.jsonl");
const COLLECTIONS_FILE = path.join(SCRATCH, "shopify_collections.json");

const PUBLIC_PRODUCTS_DIR = path.join(__dirname, "..", "public", "products");
const PUBLIC_CATEGORIES_DIR = path.join(__dirname, "..", "public", "categories");

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function downloadImage(url, destDir, baseName) {
  const ext = (new URL(url).pathname.split(".").pop() || "jpg").split("?")[0].slice(0, 4);
  const filename = `${baseName}.${ext}`;
  const destPath = path.join(destDir, filename);
  if (fs.existsSync(destPath)) return `/${path.basename(destDir)}/${filename}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  return `/${path.basename(destDir)}/${filename}`;
}

function matchesRule(product, ruleStr) {
  const [field, verb, ...rest] = ruleStr.split(" ");
  const value = rest.join(" ");
  if (field === "title" && verb === "contains") {
    return product.title.toLowerCase().includes(value.toLowerCase());
  }
  if (field === "vendor" && verb === "equals") {
    return product.vendor === value;
  }
  return false;
}

const MANUAL_MEMBERSHIP = {
  frontpage: ["Hellstar \"Beat Us!\" T-Shirt"],
  streetwear: ["B4P3 purple Camo Ape Head Tee", "B4P3 military Camo Ape Head Tee", "B4P3 Blue Camo Ape Head Tee"],
};

async function main() {
  const products = fs
    .readFileSync(PRODUCTS_FILE, "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));

  const collections = JSON.parse(fs.readFileSync(COLLECTIONS_FILE, "utf-8"));

  console.log(`Loaded ${products.length} products and ${collections.length} collections.`);

  // ---- Categories ----
  const categoryByHandle = {};
  for (const col of collections) {
    let imageUrl = null;
    if (col.image) {
      imageUrl = await downloadImage(col.image, PUBLIC_CATEGORIES_DIR, col.handle);
      console.log(`Downloaded category image: ${col.handle}`);
    }
    const category = await prisma.category.upsert({
      where: { slug: col.handle },
      update: { name: col.title, imageUrl },
      create: { name: col.title, slug: col.handle, imageUrl },
    });
    categoryByHandle[col.handle] = category;
  }

  // ---- Products ----
  for (const p of products) {
    const shopifyId = p.id.split("/").pop();
    const baseSlug = slugify(p.title);
    const slug = `${baseSlug}-${shopifyId.slice(-6)}`;

    const imageUrls = [];
    for (let i = 0; i < p.images.length; i++) {
      try {
        const localUrl = await downloadImage(p.images[i].url, PUBLIC_PRODUCTS_DIR, `${slug}-${i}`);
        imageUrls.push(localUrl);
      } catch (e) {
        console.warn(`  Image download failed for ${p.title}: ${e.message}`);
      }
    }

    const variants = p.variants.map((v) => ({
      title: v.title,
      priceCents: Math.round(parseFloat(v.price) * 100),
      inventoryQuantity: v.inventoryQuantity,
    }));

    // Determine categories
    const matchedHandles = new Set();
    for (const col of collections) {
      if (col.empty) continue;
      if (MANUAL_MEMBERSHIP[col.handle]) {
        if (MANUAL_MEMBERSHIP[col.handle].includes(p.title)) matchedHandles.add(col.handle);
        continue;
      }
      if (!col.rules || col.rules.length === 0) continue;
      const matches = col.matchAny
        ? col.rules.some((r) => matchesRule(p, r))
        : col.rules.every((r) => matchesRule(p, r));
      if (matches) matchedHandles.add(col.handle);
    }

    const existing = await prisma.product.findFirst({ where: { slug } });
    if (existing) {
      await prisma.$transaction([
        prisma.productVariant.deleteMany({ where: { productId: existing.id } }),
        prisma.productImage.deleteMany({ where: { productId: existing.id } }),
        prisma.productCategory.deleteMany({ where: { productId: existing.id } }),
      ]);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          title: p.title,
          description: p.descriptionHtml?.replace(/<[^>]+>/g, "").trim() || null,
          status: p.status === "ACTIVE" ? "ACTIVE" : "DRAFT",
          vendor: p.vendor,
          variants: { create: variants },
          images: { create: imageUrls.map((url, position) => ({ url, position })) },
          categories: {
            create: [...matchedHandles].map((handle) => ({ categoryId: categoryByHandle[handle].id })),
          },
        },
      });
    } else {
      await prisma.product.create({
        data: {
          title: p.title,
          slug,
          description: p.descriptionHtml?.replace(/<[^>]+>/g, "").trim() || null,
          status: p.status === "ACTIVE" ? "ACTIVE" : "DRAFT",
          vendor: p.vendor,
          variants: { create: variants },
          images: { create: imageUrls.map((url, position) => ({ url, position })) },
          categories: {
            create: [...matchedHandles].map((handle) => ({ categoryId: categoryByHandle[handle].id })),
          },
        },
      });
    }

    console.log(`Imported: ${p.title} (${imageUrls.length} images, ${variants.length} variants, categories: ${[...matchedHandles].join(", ") || "none"})`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
