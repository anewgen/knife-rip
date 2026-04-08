-- CreateTable
CREATE TABLE "VanityInviteObservation" (
    "code" TEXT NOT NULL,
    "wasValid" BOOLEAN NOT NULL DEFAULT false,
    "guildId" TEXT,
    "guildName" TEXT,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstSeenValidAt" TIMESTAMP(3),
    "droppedAt" TIMESTAMP(3),

    CONSTRAINT "VanityInviteObservation_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "VanityScannerCheckpoint" (
    "id" INTEGER NOT NULL,
    "nextIndex" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VanityScannerCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VanityInviteObservation_droppedAt_idx" ON "VanityInviteObservation"("droppedAt");
