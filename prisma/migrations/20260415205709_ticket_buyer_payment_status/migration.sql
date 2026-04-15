-- Add nullable buyer first to allow backfill on existing rows.
ALTER TABLE "Ticket" ADD COLUMN     "buyerId" TEXT,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3);

-- Backfill old tickets with the first available user.
UPDATE "Ticket"
SET "buyerId" = (
  SELECT "id"
  FROM "User"
  ORDER BY "createdAt" ASC
  LIMIT 1
)
WHERE "buyerId" IS NULL;

-- Enforce required buyer after backfill.
ALTER TABLE "Ticket" ALTER COLUMN "buyerId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Ticket_buyerId_idx" ON "Ticket"("buyerId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
