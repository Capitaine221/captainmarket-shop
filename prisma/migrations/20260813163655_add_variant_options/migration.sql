-- AlterTable
ALTER TABLE "Product" ADD COLUMN "option1Name" TEXT;
ALTER TABLE "Product" ADD COLUMN "option2Name" TEXT;
ALTER TABLE "Product" ADD COLUMN "option3Name" TEXT;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "option1Value" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "option2Value" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN "option3Value" TEXT;
