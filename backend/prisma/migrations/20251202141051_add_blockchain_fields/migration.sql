/*
  Warnings:

  - A unique constraint covering the columns `[walletAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NoteStatus" AS ENUM ('LOCAL', 'PENDING', 'CONFIRMED', 'FAILED');

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "status" "NoteStatus" NOT NULL DEFAULT 'LOCAL',
ADD COLUMN     "txHash" TEXT;

-- CreateIndex
CREATE INDEX "Note_status_idx" ON "Note"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");
