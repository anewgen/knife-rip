-- CreateTable
CREATE TABLE "BotGuildDenylist" (
    "guildId" TEXT NOT NULL,
    "setByDiscordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotGuildDenylist_pkey" PRIMARY KEY ("guildId")
);
