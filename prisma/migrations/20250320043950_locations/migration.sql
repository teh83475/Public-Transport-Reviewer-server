-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER,
    "latitude" DECIMAL(65,30) NOT NULL,
    "longitude" DECIMAL(65,30) NOT NULL,
    "altitude" DECIMAL(65,30) NOT NULL,
    "accuracy" DECIMAL(65,30) NOT NULL,
    "altitudeAccuracy" DECIMAL(65,30) NOT NULL,
    "heading" DECIMAL(65,30) NOT NULL,
    "speed" DECIMAL(65,30) NOT NULL,
    "timestamp" DECIMAL(65,30) NOT NULL,
    "mocked" BOOLEAN NOT NULL,
    "error" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE SET NULL ON UPDATE CASCADE;
