-- Replace Restaurant's free-text cuisineType/city columns with managed
-- Cuisine/City tables, backfilling one row per distinct existing value so
-- no restaurant loses its current cuisine/city on the cutover.

-- CreateTable
CREATE TABLE "Cuisine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKm" TEXT,
    "description" TEXT,
    "descriptionKm" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cuisine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKm" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cuisine_name_key" ON "Cuisine"("name");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_key" ON "City"("name");

-- Backfill: one Cuisine/City row per distinct existing text value.
INSERT INTO "Cuisine" ("id", "name", "updatedAt")
SELECT gen_random_uuid()::text, t."cuisineType", CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "cuisineType" FROM "Restaurant") t;

INSERT INTO "City" ("id", "name", "updatedAt")
SELECT gen_random_uuid()::text, t."city", CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "city" FROM "Restaurant") t;

-- AlterTable: add the new FK columns nullable first so we can backfill them.
ALTER TABLE "Restaurant" ADD COLUMN "cuisineId" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "cityId" TEXT;

UPDATE "Restaurant" r SET "cuisineId" = c."id" FROM "Cuisine" c WHERE c."name" = r."cuisineType";
UPDATE "Restaurant" r SET "cityId" = ci."id" FROM "City" ci WHERE ci."name" = r."city";

ALTER TABLE "Restaurant" ALTER COLUMN "cuisineId" SET NOT NULL;
ALTER TABLE "Restaurant" ALTER COLUMN "cityId" SET NOT NULL;

-- DropIndex
DROP INDEX "Restaurant_city_idx";
DROP INDEX "Restaurant_cuisineType_idx";

-- AlterTable: drop the old free-text columns now that every row has a
-- matching cuisineId/cityId.
ALTER TABLE "Restaurant" DROP COLUMN "cuisineType";
ALTER TABLE "Restaurant" DROP COLUMN "city";

-- CreateIndex
CREATE INDEX "Restaurant_cityId_idx" ON "Restaurant"("cityId");
CREATE INDEX "Restaurant_cuisineId_idx" ON "Restaurant"("cuisineId");

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_cuisineId_fkey" FOREIGN KEY ("cuisineId") REFERENCES "Cuisine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Restaurant" ADD CONSTRAINT "Restaurant_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
