import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const SCRATCH = "C:\\Users\\LENOVO\\AppData\\Local\\Temp\\claude\\C--Users-LENOVO-OneDrive-Desktop-claude-code\\c80860be-63e6-483f-93ab-270aec4c89c8\\scratchpad";
const PUBLIC_PRODUCTS_DIR = path.join(__dirname, "..", "public", "products");

// order matches p1..p27 aliases used when fetching from Shopify
const PRODUCT_GID_ORDER = [
  "8343874863219", "8343874895987", "8343874961523", "8343874994291", "8343875027059",
  "8343875059827", "8343875092595", "8343875158131", "8343875190899", "8344241733747",
  "8349100212339", "8349273555059", "8349274439795", "8349275947123", "8349277618291",
  "8349278339187", "8349399515251", "8349991075955", "8349997203571", "8350003200115",
  "8350082662515", "8350160945267", "8355476013171", "8355938730099", "8355946692723",
  "8356048240755", "8356073603187",
];

function loadBatch(file) {
  return JSON.parse(fs.readFileSync(path.join(SCRATCH, file), "utf-8"));
}

const merged = { ...loadBatch("variant_options_batch1.json"), ...loadBatch("variant_options_batch2.json"), ...loadBatch("variant_options_batch3.json") };

async function downloadImage(url, baseName) {
  const ext = (new URL(url).pathname.split(".").pop() || "jpg").split("?")[0].slice(0, 4);
  const filename = `${baseName}.${ext}`;
  const destPath = path.join(PUBLIC_PRODUCTS_DIR, filename);
  const localUrl = `/products/${filename}`;
  if (fs.existsSync(destPath)) return localUrl;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  return localUrl;
}

function slugifyPart(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  for (let i = 0; i < PRODUCT_GID_ORDER.length; i++) {
    const shopifyId = PRODUCT_GID_ORDER[i];
    const key = `p${i + 1}`;
    const data = merged[key];
    if (!data) {
      console.warn(`No data for ${key} (${shopifyId})`);
      continue;
    }

    const suffix = shopifyId.slice(-6);
    const product = await prisma.product.findFirst({
      where: { slug: { endsWith: `-${suffix}` } },
      include: { variants: true, images: true },
    });
    if (!product) {
      console.warn(`No DB product found for suffix -${suffix}`);
      continue;
    }

    const variants = data.variants.nodes;
    const optionNames = (variants[0]?.selectedOptions ?? []).map((o) => o.name);
    const isRealOptions = !(optionNames.length === 1 && variants.length === 1 && variants[0].selectedOptions[0].value === "Default Title");

    if (isRealOptions) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          option1Name: optionNames[0] ?? null,
          option2Name: optionNames[1] ?? null,
          option3Name: optionNames[2] ?? null,
        },
      });
    }

    let nextImagePosition = product.images.length;

    for (const v of variants) {
      const dbVariant = product.variants.find((dv) => dv.title === v.title);
      if (!dbVariant) {
        console.warn(`  No matching DB variant for title "${v.title}" on product ${product.slug}`);
        continue;
      }

      const values = v.selectedOptions.map((o) => o.value);
      let localImageUrl = null;

      if (v.image?.url) {
        const colorPart = slugifyPart(values[0] || "variant");
        const baseName = `${product.slug}-opt-${colorPart}`;
        localImageUrl = await downloadImage(v.image.url, baseName);

        if (!product.images.some((img) => img.url === localImageUrl) && !(await prisma.productImage.findFirst({ where: { productId: product.id, url: localImageUrl } }))) {
          await prisma.productImage.create({
            data: { productId: product.id, url: localImageUrl, position: nextImagePosition++ },
          });
          product.images.push({ url: localImageUrl });
        }
      }

      await prisma.productVariant.update({
        where: { id: dbVariant.id },
        data: {
          option1Value: isRealOptions ? values[0] ?? null : null,
          option2Value: isRealOptions ? values[1] ?? null : null,
          option3Value: isRealOptions ? values[2] ?? null : null,
          imageUrl: localImageUrl,
        },
      });
    }

    console.log(`Enriched: ${product.title} (${optionNames.join(", ") || "no options"})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
