/*
  Warnings:

  - The values [MODERATOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `Waste_info` on the `Waste` table. All the data in the column will be lost.
  - You are about to drop the column `Waste_name` on the `Waste` table. All the data in the column will be lost.
  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Image_path` to the `Waste` table without a default value. This is not possible if the table is not empty.
  - Added the required column `User_ID` to the `Waste` table without a default value. This is not possible if the table is not empty.
  - Added the required column `WasteType_ID` to the `Waste` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "History_Type" AS ENUM ('GET', 'USE');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'USER');
ALTER TABLE "public"."User" ALTER COLUMN "Role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "Role" TYPE "Role_new" USING ("Role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "Role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."History" DROP CONSTRAINT "History_Image_ID_fkey";

-- DropForeignKey
ALTER TABLE "public"."History" DROP CONSTRAINT "History_User_ID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_User_ID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Image" DROP CONSTRAINT "Image_Waste_ID_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Points" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Waste" DROP COLUMN "Waste_info",
DROP COLUMN "Waste_name",
ADD COLUMN     "Image_path" TEXT NOT NULL,
ADD COLUMN     "Is_correct" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "Probs" DOUBLE PRECISION[],
ADD COLUMN     "Timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "User_ID" INTEGER NOT NULL,
ADD COLUMN     "Vote_wastetype" DOUBLE PRECISION[],
ADD COLUMN     "WasteType_ID" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."History";

-- DropTable
DROP TABLE "public"."Image";

-- CreateTable
CREATE TABLE "WasteType" (
    "WasteType_ID" SERIAL NOT NULL,
    "Waste_name" TEXT NOT NULL,
    "Waste_info" TEXT NOT NULL,

    CONSTRAINT "WasteType_pkey" PRIMARY KEY ("WasteType_ID")
);

-- CreateTable
CREATE TABLE "PointHistory" (
    "PointHistory_ID" SERIAL NOT NULL,
    "User_ID" INTEGER NOT NULL,
    "History_Detail" TEXT NOT NULL,
    "History_Type" "History_Type" NOT NULL,

    CONSTRAINT "PointHistory_pkey" PRIMARY KEY ("PointHistory_ID")
);

-- CreateTable
CREATE TABLE "RecycleShop" (
    "Shop_ID" SERIAL NOT NULL,
    "User_ID" INTEGER NOT NULL,
    "Shop_name" TEXT NOT NULL,
    "Tel_num" TEXT NOT NULL,
    "Location" DOUBLE PRECISION[],
    "Accepted_cate" INTEGER[],

    CONSTRAINT "RecycleShop_pkey" PRIMARY KEY ("Shop_ID")
);

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_WasteType_ID_fkey" FOREIGN KEY ("WasteType_ID") REFERENCES "WasteType"("WasteType_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointHistory" ADD CONSTRAINT "PointHistory_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecycleShop" ADD CONSTRAINT "RecycleShop_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
