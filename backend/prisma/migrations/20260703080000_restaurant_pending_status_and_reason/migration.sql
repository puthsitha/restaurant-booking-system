-- AlterEnum
ALTER TYPE "RestaurantStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "statusReason" TEXT;
