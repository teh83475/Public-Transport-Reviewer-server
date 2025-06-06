/*
  Warnings:

  - You are about to drop the column `diverIdentity` on the `Review` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Review" DROP COLUMN "diverIdentity",
ADD COLUMN     "driverIdentity" TEXT NOT NULL DEFAULT '';
