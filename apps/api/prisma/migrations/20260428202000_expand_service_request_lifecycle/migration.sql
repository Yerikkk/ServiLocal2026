-- Extend enum values for full request lifecycle
ALTER TYPE "ServiceRequestStatus" ADD VALUE IF NOT EXISTS 'NEGOTIATION';
ALTER TYPE "ServiceRequestStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';
ALTER TYPE "ServiceRequestStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
ALTER TYPE "ServiceRequestStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
ALTER TYPE "ServiceRequestStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- Migrate legacy rejected status to cancelled semantics
UPDATE "ServiceRequest"
SET "status" = 'CANCELLED'
WHERE "status" = 'REJECTED';

-- Add expiration deadline for pending requests
ALTER TABLE "ServiceRequest"
ADD COLUMN "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '48 hours');
