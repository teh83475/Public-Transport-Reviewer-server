-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "registrationMark" DROP NOT NULL,
ALTER COLUMN "driverIdentity" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ExpiredToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "ExpiredToken_pkey" PRIMARY KEY ("id")
);
