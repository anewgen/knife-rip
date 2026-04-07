-- CreateEnum
CREATE TYPE "BotCommandRoleOverrideEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateTable
CREATE TABLE "BotGuildCommandDisable" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "commandKey" TEXT NOT NULL,
    "channelScope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotGuildCommandDisable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotGuildCommandRoleOverride" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "commandKey" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "channelScope" TEXT NOT NULL,
    "effect" "BotCommandRoleOverrideEffect" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotGuildCommandRoleOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BotGuildCommandDisable_guildId_commandKey_channelScope_key" ON "BotGuildCommandDisable"("guildId", "commandKey", "channelScope");

-- CreateIndex
CREATE INDEX "BotGuildCommandDisable_guildId_idx" ON "BotGuildCommandDisable"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "BotGuildCommandRoleOverride_guildId_commandKey_roleId_channelScope_key" ON "BotGuildCommandRoleOverride"("guildId", "commandKey", "roleId", "channelScope");

-- CreateIndex
CREATE INDEX "BotGuildCommandRoleOverride_guildId_idx" ON "BotGuildCommandRoleOverride"("guildId");
