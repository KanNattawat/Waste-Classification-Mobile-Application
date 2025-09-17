/*
  Warnings:

  - You are about to drop the column `User_email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[User_name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `User_name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."User_User_email_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "User_email",
ALTER COLUMN "User_name" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_User_name_key" ON "public"."User"("User_name");
