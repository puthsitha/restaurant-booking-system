-- AlterTable
ALTER TABLE "RestaurantRequest" ADD COLUMN     "reviewNote" TEXT,
ADD COLUMN     "reviewedById" TEXT,
ALTER COLUMN "reason" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "RestaurantRequest" ADD CONSTRAINT "RestaurantRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

