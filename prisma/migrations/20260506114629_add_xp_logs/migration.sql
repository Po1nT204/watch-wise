-- CreateTable
CREATE TABLE "XpLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XpLog_userId_createdAt_idx" ON "XpLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "XpLog" ADD CONSTRAINT "XpLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
