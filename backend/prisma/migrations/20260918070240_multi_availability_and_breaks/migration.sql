-- DropIndex
DROP INDEX "doctor_availabilities_doctorId_date_key";

-- CreateTable
CREATE TABLE "doctor_breaks" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_breaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doctor_breaks_doctorId_date_idx" ON "doctor_breaks"("doctorId", "date");

-- CreateIndex
CREATE INDEX "doctor_availabilities_doctorId_date_idx" ON "doctor_availabilities"("doctorId", "date");

-- AddForeignKey
ALTER TABLE "doctor_breaks" ADD CONSTRAINT "doctor_breaks_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
