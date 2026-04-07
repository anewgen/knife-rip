-- CreateTable
CREATE TABLE "BotGuildMemberTextStats" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotGuildMemberTextStats_pkey" PRIMARY KEY ("guildId","userId")
);

-- CreateTable
CREATE TABLE "BotGuildMemberVoiceStats" (
    "guildId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voiceSeconds" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotGuildMemberVoiceStats_pkey" PRIMARY KEY ("guildId","userId")
);

-- CreateIndex
CREATE INDEX "BotGuildMemberTextStats_guildId_messageCount_idx" ON "BotGuildMemberTextStats"("guildId", "messageCount" DESC);

-- CreateIndex
CREATE INDEX "BotGuildMemberVoiceStats_guildId_voiceSeconds_idx" ON "BotGuildMemberVoiceStats"("guildId", "voiceSeconds" DESC);
