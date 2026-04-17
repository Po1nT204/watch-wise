-- AlterTable
ALTER TABLE "GeneratedContent" ADD COLUMN     "audience" TEXT NOT NULL DEFAULT 'student',
ADD COLUMN     "focus" TEXT NOT NULL DEFAULT 'theory';
