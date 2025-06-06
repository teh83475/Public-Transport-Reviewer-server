/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `reviewId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Made the column `posterId` on table `Comment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_posterId_fkey";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "reviewId" INTEGER NOT NULL,
ALTER COLUMN "postedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "posterId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "postedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
