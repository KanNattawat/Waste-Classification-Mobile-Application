-- AlterTable
ALTER TABLE "PointHistory" ADD COLUMN     "Timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "RecycleShop" ADD COLUMN     "Status" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PointShop" (
    "Item_ID" SERIAL NOT NULL,
    "Item_name" TEXT NOT NULL,
    "Usage_Limit" INTEGER NOT NULL,
    "Point_Usage" INTEGER NOT NULL,
    "Expire_Date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointShop_pkey" PRIMARY KEY ("Item_ID")
);
