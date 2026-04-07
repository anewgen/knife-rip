-- CreateTable
CREATE TABLE "BotGuildCommandAudit" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "commandKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotGuildCommandAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotGuildCommandAudit_guildId_createdAt_idx" ON "BotGuildCommandAudit"("guildId", "createdAt");
