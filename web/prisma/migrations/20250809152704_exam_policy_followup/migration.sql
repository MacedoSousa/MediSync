-- CreateEnum
CREATE TYPE "public"."ExamModePolicy" AS ENUM ('IN_PERSON_ONLY', 'ANY');

-- AlterTable
ALTER TABLE "public"."Appointment" ADD COLUMN     "isFollowUp" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."ExamOrder" ADD COLUMN     "examTypeId" TEXT,
ADD COLUMN     "mode" "public"."VisitMode";

-- CreateTable
CREATE TABLE "public"."ExamType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "policy" "public"."ExamModePolicy" NOT NULL DEFAULT 'IN_PERSON_ONLY',

    CONSTRAINT "ExamType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamType_name_key" ON "public"."ExamType"("name");

-- AddForeignKey
ALTER TABLE "public"."ExamOrder" ADD CONSTRAINT "ExamOrder_examTypeId_fkey" FOREIGN KEY ("examTypeId") REFERENCES "public"."ExamType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
