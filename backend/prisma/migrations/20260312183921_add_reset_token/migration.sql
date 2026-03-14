/*
  Warnings:

  - Added the required column `Item_Image_path` to the `PointShop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PointHistory" ALTER COLUMN "PointsChanged" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PointShop" ADD COLUMN     "Item_Image_path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "ResetToken" TEXT DEFAULT '';
