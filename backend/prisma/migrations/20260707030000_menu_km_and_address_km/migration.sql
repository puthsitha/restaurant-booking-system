-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "addressKm" TEXT;

-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "nameKm" TEXT,
ADD COLUMN     "descriptionKm" TEXT;

-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "nameKm" TEXT,
ADD COLUMN     "descriptionKm" TEXT;
