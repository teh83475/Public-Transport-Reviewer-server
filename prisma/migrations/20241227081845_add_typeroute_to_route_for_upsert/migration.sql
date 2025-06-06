/*
  Warnings:

  - A unique constraint covering the columns `[type_route]` on the table `Route` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type_route` to the `Route` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "type_route" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Route_type_route_key" ON "Route"("type_route");
