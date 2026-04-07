-- CreateTable
CREATE TABLE "VoiceMasterGuildConfig" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "hubChannelId" TEXT NOT NULL,
    "panelChannelId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "privateCategoryId" TEXT,
    "defaultNameTemplate" TEXT NOT NULL DEFAULT '{user}''s channel',
    "defaultBitrate" INTEGER NOT NULL DEFAULT 64000,
    "defaultRegion" TEXT,
    "defaultRoleId" TEXT,
    "joinRoleId" TEXT,
    "defaultInterface" BOOLEAN NOT NULL DEFAULT false,
    "panelMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceMasterGuildConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceMasterTempChannel" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "statusLabel" TEXT,
    "musicOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VoiceMasterTempChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoiceMasterGuildConfig_guildId_key" ON "VoiceMasterGuildConfig"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceMasterTempChannel_channelId_key" ON "VoiceMasterTempChannel"("channelId");

-- CreateIndex
CREATE INDEX "VoiceMasterTempChannel_guildId_idx" ON "VoiceMasterTempChannel"("guildId");

-- CreateIndex
CREATE INDEX "VoiceMasterTempChannel_ownerId_idx" ON "VoiceMasterTempChannel"("ownerId");
