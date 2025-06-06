-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('BUS', 'MINIBUS', 'TRAIN', 'TAXI', 'OTHER');

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "diverIdentity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "registrationMark" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" "TransportType" NOT NULL DEFAULT 'OTHER';
