-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "routeId" INTEGER;

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "type" "TransportType" NOT NULL DEFAULT 'OTHER',
    "name" TEXT NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;
