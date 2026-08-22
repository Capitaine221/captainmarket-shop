-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "onSale" BOOLEAN NOT NULL DEFAULT false,
    "salePriceCents" INTEGER,
    "inventoryQuantity" INTEGER NOT NULL DEFAULT 0,
    "sku" TEXT,
    "option1Value" TEXT,
    "option2Value" TEXT,
    "option3Value" TEXT,
    "imageUrl" TEXT,
    "productId" TEXT NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("id", "imageUrl", "inventoryQuantity", "option1Value", "option2Value", "option3Value", "priceCents", "productId", "sku", "title") SELECT "id", "imageUrl", "inventoryQuantity", "option1Value", "option2Value", "option3Value", "priceCents", "productId", "sku", "title" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
CREATE TABLE "new_WebsitePackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceMinCents" INTEGER NOT NULL,
    "priceMaxCents" INTEGER,
    "onSale" BOOLEAN NOT NULL DEFAULT false,
    "salePriceCents" INTEGER,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_WebsitePackage" ("createdAt", "description", "id", "name", "position", "priceMaxCents", "priceMinCents", "updatedAt") SELECT "createdAt", "description", "id", "name", "position", "priceMaxCents", "priceMinCents", "updatedAt" FROM "WebsitePackage";
DROP TABLE "WebsitePackage";
ALTER TABLE "new_WebsitePackage" RENAME TO "WebsitePackage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
