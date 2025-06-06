/*
  Warnings:

  - You are about to drop the column `downvote_count` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `upvote_count` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `downvote_count` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `poster` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `upvote_count` on the `Review` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `postedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postedAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posterId` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rating` on the `Review` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "downvote_count",
DROP COLUMN "upvote_count",
ADD COLUMN     "postedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "posterId" TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "downvote_count",
DROP COLUMN "poster",
DROP COLUMN "upvote_count",
ADD COLUMN     "postedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "posterId" TEXT NOT NULL,
DROP COLUMN "rating",
ADD COLUMN     "rating" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "_upvotedReview" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_downvotedReview" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_upvotedReview_AB_unique" ON "_upvotedReview"("A", "B");

-- CreateIndex
CREATE INDEX "_upvotedReview_B_index" ON "_upvotedReview"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_downvotedReview_AB_unique" ON "_downvotedReview"("A", "B");

-- CreateIndex
CREATE INDEX "_downvotedReview_B_index" ON "_downvotedReview"("B");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_upvotedReview" ADD CONSTRAINT "_upvotedReview_A_fkey" FOREIGN KEY ("A") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_upvotedReview" ADD CONSTRAINT "_upvotedReview_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_downvotedReview" ADD CONSTRAINT "_downvotedReview_A_fkey" FOREIGN KEY ("A") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_downvotedReview" ADD CONSTRAINT "_downvotedReview_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
