/*
  Warnings:

  - You are about to drop the column `ResetToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "ResetToken";

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "ResetToken" TEXT NOT NULL,
    "User_ID" INTEGER NOT NULL,
    "Expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("ResetToken")
);

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_User_ID_fkey" FOREIGN KEY ("User_ID") REFERENCES "User"("User_ID") ON DELETE RESTRICT ON UPDATE CASCADE;
