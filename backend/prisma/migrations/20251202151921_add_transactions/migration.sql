/*
  Warnings:

  - The values [LOCAL] on the enum `NoteStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NoteStatus_new" AS ENUM ('PENDING', 'SUBMITTED', 'CONFIRMED', 'FAILED');
ALTER TABLE "Note" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Note" ALTER COLUMN "status" TYPE "NoteStatus_new" USING ("status"::text::"NoteStatus_new");
ALTER TYPE "NoteStatus" RENAME TO "NoteStatus_old";
ALTER TYPE "NoteStatus_new" RENAME TO "NoteStatus";
DROP TYPE "NoteStatus_old";
ALTER TABLE "Note" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderWallet" TEXT NOT NULL,
    "recipientWallet" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "txHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_txHash_key" ON "Transaction"("txHash");

-- CreateIndex
CREATE INDEX "Transaction_senderId_idx" ON "Transaction"("senderId");

-- CreateIndex
CREATE INDEX "Transaction_senderWallet_idx" ON "Transaction"("senderWallet");

-- CreateIndex
CREATE INDEX "Transaction_recipientWallet_idx" ON "Transaction"("recipientWallet");

-- CreateIndex
CREATE INDEX "Transaction_txHash_idx" ON "Transaction"("txHash");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
