-- CreateTable
CREATE TABLE "BotGuildSettings" (
    "guildId" TEXT NOT NULL,
    "commandPrefix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotGuildSettings_pkey" PRIMARY KEY ("guildId")
);
