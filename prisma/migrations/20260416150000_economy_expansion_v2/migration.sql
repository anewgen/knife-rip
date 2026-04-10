-- AlterTable
ALTER TABLE "EconomyUser" ADD COLUMN     "bankCash" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN     "bankTier" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastBankInterestAt" TIMESTAMP(3),
ADD COLUMN     "lastWorkAt" TIMESTAMP(3),
ADD COLUMN     "lastCrimeAt" TIMESTAMP(3),
ADD COLUMN     "lastBegAt" TIMESTAMP(3),
ADD COLUMN     "lastRobAt" TIMESTAMP(3),
ADD COLUMN     "lastMineAt" TIMESTAMP(3),
ADD COLUMN     "lastFishAt" TIMESTAMP(3),
ADD COLUMN     "lastRobbedAt" TIMESTAMP(3),
ADD COLUMN     "robVictimCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "robVictimDay" TEXT;

-- CreateTable
CREATE TABLE "EconomyPet" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "speciesKey" TEXT NOT NULL,
    "nickname" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "happiness" INTEGER NOT NULL DEFAULT 100,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EconomyPet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomyBusinessSlot" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "businessKey" TEXT NOT NULL,
    "tier" INTEGER NOT NULL DEFAULT 1,
    "lastCollectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EconomyBusinessSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomyDuel" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT,
    "challengerDiscordId" TEXT NOT NULL,
    "opponentDiscordId" TEXT NOT NULL,
    "stake" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "winnerDiscordId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EconomyDuel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomyBounty" (
    "id" TEXT NOT NULL,
    "posterDiscordId" TEXT NOT NULL,
    "targetDiscordId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "guildId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "claimerDiscordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "EconomyBounty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EconomyPet_ownerId_idx" ON "EconomyPet"("ownerId");

-- CreateIndex
CREATE INDEX "EconomyPet_ownerId_equipped_idx" ON "EconomyPet"("ownerId", "equipped");

-- CreateIndex
CREATE INDEX "EconomyBusinessSlot_ownerId_idx" ON "EconomyBusinessSlot"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "EconomyBusinessSlot_ownerId_businessKey_key" ON "EconomyBusinessSlot"("ownerId", "businessKey");

-- CreateIndex
CREATE INDEX "EconomyDuel_status_expiresAt_idx" ON "EconomyDuel"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "EconomyDuel_opponentDiscordId_status_idx" ON "EconomyDuel"("opponentDiscordId", "status");

-- CreateIndex
CREATE INDEX "EconomyBounty_guildId_status_idx" ON "EconomyBounty"("guildId", "status");

-- CreateIndex
CREATE INDEX "EconomyBounty_targetDiscordId_status_idx" ON "EconomyBounty"("targetDiscordId", "status");

-- AddForeignKey
ALTER TABLE "EconomyPet" ADD CONSTRAINT "EconomyPet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "EconomyUser"("discordUserId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EconomyBusinessSlot" ADD CONSTRAINT "EconomyBusinessSlot_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "EconomyUser"("discordUserId") ON DELETE CASCADE ON UPDATE CASCADE;
