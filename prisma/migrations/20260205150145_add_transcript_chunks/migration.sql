-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "QuizQuestion" ALTER COLUMN "timestamp" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "TranscriptChunk" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "TranscriptChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TranscriptChunk_videoId_idx" ON "TranscriptChunk"("videoId");

-- CreateIndex
CREATE INDEX "GeneratedContent_videoId_userId_idx" ON "GeneratedContent"("videoId", "userId");

-- CreateIndex
CREATE INDEX "QuizQuestion_contentId_idx" ON "QuizQuestion"("contentId");

-- AddForeignKey
ALTER TABLE "TranscriptChunk" ADD CONSTRAINT "TranscriptChunk_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
