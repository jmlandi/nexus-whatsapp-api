/*
  Warnings:

  - You are about to drop the column `report_timestamp` on the `reports` table. All the data in the column will be lost.
  - Added the required column `end_date` to the `reports` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `reports` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "reports" DROP COLUMN "report_timestamp",
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "reports_start_date_idx" ON "reports"("start_date");

-- CreateIndex
CREATE INDEX "reports_end_date_idx" ON "reports"("end_date");
