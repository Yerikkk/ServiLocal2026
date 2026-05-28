-- CreateTable
CREATE TABLE "ServiceRequestMessage" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "senderUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceRequestMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceRequestMessage_requestId_createdAt_idx" ON "ServiceRequestMessage"("requestId", "createdAt");

-- CreateIndex
CREATE INDEX "ServiceRequestMessage_senderUserId_idx" ON "ServiceRequestMessage"("senderUserId");

-- AddForeignKey
ALTER TABLE "ServiceRequestMessage" ADD CONSTRAINT "ServiceRequestMessage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceRequestMessage" ADD CONSTRAINT "ServiceRequestMessage_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
