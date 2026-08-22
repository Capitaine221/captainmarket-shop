/*
  Warnings:

  - You are about to drop the column `priceCents` on the `WebsitePackage` table. All the data in the column will be lost.
  - Added the required column `priceMinCents` to the `WebsitePackage` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WebsitePackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceMinCents" INTEGER NOT NULL,
    "priceMaxCents" INTEGER,
    "description" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_WebsitePackage" ("createdAt", "description", "id", "name", "position", "updatedAt") SELECT "createdAt", "description", "id", "name", "position", "updatedAt" FROM "WebsitePackage";
DROP TABLE "WebsitePackage";
ALTER TABLE "new_WebsitePackage" RENAME TO "WebsitePackage";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
