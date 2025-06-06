-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_posterId_fkey";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "posterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_posterId_fkey" FOREIGN KEY ("posterId") REFERENCES "User"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
