/*
  Warnings:

  - You are about to alter the column `Vote_wastetype` on the `Waste` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Waste" ALTER COLUMN "Vote_wastetype" SET DATA TYPE INTEGER[];
