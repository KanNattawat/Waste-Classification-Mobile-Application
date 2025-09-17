/*
  Warnings:

  - Added the required column `Full_name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "Full_name" TEXT NOT NULL;
